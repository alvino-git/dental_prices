import { useState, useEffect, useMemo } from 'react'

function App() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    fetch('/dental-prices/prices.csv')
      .then(res => res.text())
      .then(csv => {
        const lines = csv.split('\n').filter(line => line.trim())
        const headers = lines[0].split(',')
        const data = lines.slice(1).map(line => {
          const values = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g) || []
          return {
            code: values[0]?.replace(/"/g, '').trim() || '',
            category: values[1]?.replace(/"/g, '').trim() || '',
            service: values[2]?.replace(/"/g, '').trim() || '',
            price: values[3]?.replace(/"/g, '').trim() || '',
            aasandha: values[4]?.replace(/"/g, '').trim() || '',
            patient: values[5]?.replace(/"/g, '').trim() || ''
          }
        })
        setServices(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error loading CSV:', err)
        setLoading(false)
      })
  }, [])

  const categories = useMemo(() => {
    const cats = [...new Set(services.map(s => s.category).filter(Boolean))]
    return cats.sort()
  }, [services])

  const filteredServices = useMemo(() => {
    return services.filter(service => {
      const matchesSearch = searchTerm === '' || 
        service.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.price.includes(searchTerm)
      
      const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory
      
      return matchesSearch && matchesCategory
    })
  }, [services, searchTerm, selectedCategory])

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('all')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-teal-600 mx-auto mb-4"></div>
          <p className="text-teal-700 font-medium">Loading services...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-2xl shadow-2xl p-8 mb-8">
          <h1 className="text-4xl font-bold mb-2">Dental Services Price List</h1>
          <p className="text-teal-100 text-lg">{services.length}+ Services Available</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <input
                type="text"
                placeholder="Search by service name, code, category, or price..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border-2 border-teal-200 rounded-lg focus:outline-none focus:border-teal-500 transition-colors"
              />
            </div>
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 border-2 border-teal-200 rounded-lg focus:outline-none focus:border-teal-500 transition-colors"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-4">
            <p className="text-gray-600">
              Showing <span className="font-semibold text-teal-600">{filteredServices.length}</span> of {services.length} services
            </p>
            {(searchTerm || selectedCategory !== 'all') && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Results Table */}
        {filteredServices.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">No services found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-teal-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Item Code</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Service Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Category</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold">Price (MVR)</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold">Aasandha (MVR)</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold">Patient (MVR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredServices.map((service, idx) => (
                    <tr key={idx} className="hover:bg-teal-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{service.code}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{service.service}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{service.category}</td>
                      <td className="px-6 py-4 text-sm text-right font-semibold text-teal-700">{service.price}</td>
                      <td className="px-6 py-4 text-sm text-right text-gray-600">{service.aasandha || '-'}</td>
                      <td className="px-6 py-4 text-sm text-right text-gray-600">{service.patient}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
