'use client'
import React, { useEffect, useMemo, useState } from 'react';
import { ListItem, SummaryData } from './types';
import dayjs from 'dayjs';

// 获取总结数据
async function fetchSummary() {
  const options = {
    method: 'GET',
    headers: {accept: 'application/json'}
  }
  const data = await fetch(`https://asterixlabs.top/dashboard/summary`, options).then(response => response.json())
  return data.result || {}
}

// 获取列表数据
async function fetchList() {
  const options = {
    method: 'GET',
    headers: {accept: 'application/json'}
  }
  const data = await fetch(`https://asterixlabs.top/dashboard/list`, options).then(response => response.json())
  return data.result || []
}

const pageSize = 50
const DashboardPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [updateTime, setUpdateTime] = useState('')
  const [summaryData, setSummaryData] = useState<SummaryData>({
    totalPoint: 0,
    totalPower: 0,
    totalAsterix: 0,
    stakeAddressCount: 0,
  })
  const [totalList, setTotalList] = useState<Array<ListItem>>([])
  const [pageNumber, setPageNumber] = useState(1)

  const currentList = useMemo(() => {
    let list = []
    if (searchTerm.length === 42) {
      list = totalList.filter(item => item.ownerAddress.toLowerCase() == searchTerm.toLowerCase())
    } else {
      const startIndex = (pageNumber - 1) * pageSize
      list = totalList.slice(startIndex, startIndex + pageSize)
    }
    return list.map(item => {
      const start = item.ownerAddress.slice(0, 7);
      const end = item.ownerAddress.slice(-4);
      return {
        ...item,
        shortAddress: `${start}...${end}`
      }
    })
  }, [totalList, pageNumber, searchTerm])

  useEffect(() => {
    async function querySummery() {
      const data = await fetchSummary()
      setSummaryData(Object.assign({}, summaryData, data))
    }

    async function queryList() {
      const data = await fetchList()
      setTotalList(data.map((item: any, index: number) => {
        return {
          ...item,
          index: index + 1
        }
      }))
      const updateTime = data[0]?.valueUpdateTime
      setUpdateTime(dayjs(updateTime).format('YYYY-MM-DD HH:mm'))
    }

    querySummery()
    queryList()
  }, [])

  function onPrev() {
    if (pageNumber == 1) return
    setPageNumber(pageNumber - 1)
  }
  function onNext() {
    if (currentList.length < pageSize) return
    setPageNumber(pageNumber + 1)
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold flex items-center justify-between">
          <div className='flex items-center'>
            <img className='w-8 h-8 inline-block mr-4' src='/astx.svg' alt="" />
            $Astro Dashboard
          </div>

          <a href="https://x.com/COperaOfficial" target='_blank'>
            <img src="data:image/svg+xml,%3csvg%20width='25'%20height='25'%20viewBox='0%200%2025%2025'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%20id='svg-812605537_424'%3e%3cpath%20d='M13.7503%2010.9868L19.5366%204.21191H18.1651L13.1423%2010.0942L9.12857%204.21191H4.5L10.5686%2013.1079L4.5%2020.2119H5.87143L11.1766%2013.9993L15.4154%2020.2119H20.044L13.7503%2010.9868ZM11.8726%2013.1856L11.2577%2012.2999L6.36514%205.25191H8.47143L12.4189%2010.9399L13.0337%2011.8256L18.1663%2019.2199H16.06L11.8726%2013.1856Z'%20fill='black'%3e%3c/path%3e%3c/svg%3e" alt="" />
          </a>
        </h1>
        
        {updateTime && <p className='my-4'>update time: { updateTime } (update 6 hours each)</p>}
        
        {/* Summary Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {Object.entries(summaryData).map(([key, value]) => (
            <div key={key} className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-lg font-semibold capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</h2>
              <p className="text-2xl font-bold">{value.toLocaleString()}</p>
            </div>
          ))}
        </div>
        
        {/* List Section */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search by address"
              className="w-full p-2 border border-gray-300 rounded"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {
            currentList.length > 0 ? <ul>
              {currentList.map((item) => (
                <li key={item.index} className='border-b last:border-b-0 py-2'>
                  <div className="flex flex-row justify-between items-start items-center">
                    <div className="mb-1 sm:mb-0">
                      <span className="font-semibold mr-2">{item.index}.</span>
                      <span className="text-gray-600">{item.shortAddress.toLowerCase()}</span>
                    </div>
                    <span className="font-bold">{item.point ? (+item.point).toLocaleString() : ''}</span>
                  </div>
                  <p className='mt-1 pl-4 flex items-center justify-between md:justify-start'>
                    <div className='flex items-center'>
                      <img className='w-4 h-4 mr-2' src='/astx.svg' alt="" />
                      <span>{ item.asterix ? Number(item.asterix) : 0 } $astx</span>
                    </div>

                    <div className='flex items-center ml-8'>
                      <span className='mr-2'>power:</span>
                      <span>{ item.power ? (+item.power).toLocaleString() : '' }</span>
                    </div>
                  </p>
                </li>
              ))}
            </ul>
            :
            (
              <div>no data</div>
            )
          }

          {
            searchTerm.length !== 42 && <div className="flex justify-end space-x-4 mt-4">
              <button
                onClick={onPrev}
                className="px-4 py-2 bg-blue-400 text-white rounded hover:bg-blue-600 focus:outline-none"
              >
                Prev
              </button>
              <button
                onClick={onNext}
                className="px-4 py-2 bg-blue-400 text-white rounded hover:bg-blue-600 focus:outline-none"
              >
                Next
              </button>
            </div>
          }
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;