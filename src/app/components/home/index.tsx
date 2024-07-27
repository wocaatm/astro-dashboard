'use client'
import React, { useEffect, useMemo, useState } from 'react';
import { ListItem, SummaryData } from './types';

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
        <h1 className="text-3xl font-bold mb-8">$Astro Dashboard</h1>
        
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
                <li key={item.index} className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-2 border-b last:border-b-0">
                  <div className="mb-1 sm:mb-0">
                    <span className="font-semibold mr-2">{item.index}.</span>
                    <span className="text-gray-600">{item.shortAddress.toLowerCase()}</span>
                  </div>
                  <span className="font-bold">{item.point ? (+item.point).toLocaleString() : ''}</span>
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