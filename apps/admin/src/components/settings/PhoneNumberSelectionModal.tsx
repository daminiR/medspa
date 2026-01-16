'use client'

import { useState, useMemo } from 'react'
import { X, Phone, MapPin, Loader2, Search } from 'lucide-react'

interface AvailablePhoneNumber {
  phoneNumber: string
  friendlyName: string
  locality: string
  region: string
  capabilities: {
    voice: boolean
    sms: boolean
    mms: boolean
  }
  monthlyPrice: number
}

interface PhoneNumberSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectNumber: (phoneNumber: string) => void
}

// Mock data for available phone numbers
const generateMockNumbers = (areaCode: string): AvailablePhoneNumber[] => {
  const localities: { [key: string]: string[] } = {
    '310': ['Los Angeles', 'Beverly Hills', 'Santa Monica', 'Malibu'],
    '212': ['Manhattan', 'New York', 'Bronx'],
    '415': ['San Francisco', 'Oakland', 'Berkeley'],
    '305': ['Miami', 'Miami Beach', 'Coral Gables'],
    '512': ['Austin', 'Round Rock', 'Cedar Park'],
    '646': ['Manhattan', 'New York', 'Queens'],
    '213': ['Los Angeles', 'Downtown LA'],
    '858': ['San Diego', 'La Jolla', 'Del Mar'],
    '617': ['Boston', 'Cambridge', 'Somerville'],
    '702': ['Las Vegas', 'Henderson', 'North Las Vegas']
  }

  const localityList = localities[areaCode] || ['City', 'Town', 'District']
  const region = areaCode.startsWith('3') ? 'CA' : areaCode.startsWith('2') ? 'NY' :
                 areaCode.startsWith('4') ? 'CA' : areaCode.startsWith('5') ? 'TX' :
                 areaCode.startsWith('6') ? 'MA' : areaCode.startsWith('7') ? 'NV' : 'CA'

  const numbers: AvailablePhoneNumber[] = []

  for (let i = 0; i < 8; i++) {
    const prefix = Math.floor(Math.random() * 900) + 100
    const lineNumber = Math.floor(Math.random() * 9000) + 1000
    const locality = localityList[Math.floor(Math.random() * localityList.length)]

    numbers.push({
      phoneNumber: `+1${areaCode}${prefix}${lineNumber}`,
      friendlyName: `+1 (${areaCode}) ${prefix}-${lineNumber}`,
      locality,
      region,
      capabilities: {
        voice: true,
        sms: true,
        mms: Math.random() > 0.3
      },
      monthlyPrice: 1.00
    })
  }

  return numbers
}

// Popular area codes
const AREA_CODES = [
  { code: '310', region: 'Los Angeles, CA', popular: true },
  { code: '212', region: 'New York, NY', popular: true },
  { code: '415', region: 'San Francisco, CA', popular: true },
  { code: '305', region: 'Miami, FL', popular: true },
  { code: '512', region: 'Austin, TX', popular: true },
  { code: '646', region: 'New York, NY', popular: false },
  { code: '213', region: 'Los Angeles, CA', popular: false },
  { code: '858', region: 'San Diego, CA', popular: false },
  { code: '617', region: 'Boston, MA', popular: false },
  { code: '702', region: 'Las Vegas, NV', popular: false }
]

export default function PhoneNumberSelectionModal({
  isOpen,
  onClose,
  onSelectNumber
}: PhoneNumberSelectionModalProps) {
  const [selectedAreaCode, setSelectedAreaCode] = useState(AREA_CODES[0].code)
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Generate available numbers based on selected area code
  const availableNumbers = useMemo(() => {
    return generateMockNumbers(selectedAreaCode)
  }, [selectedAreaCode])

  // Filter numbers based on search
  const filteredNumbers = useMemo(() => {
    if (!searchTerm.trim()) return availableNumbers

    const search = searchTerm.toLowerCase()
    return availableNumbers.filter(num =>
      num.friendlyName.toLowerCase().includes(search) ||
      num.locality.toLowerCase().includes(search)
    )
  }, [availableNumbers, searchTerm])

  if (!isOpen) return null

  const handleAreaCodeChange = (code: string) => {
    setIsLoading(true)
    setSelectedAreaCode(code)
    setSearchTerm('')
    // Simulate API delay
    setTimeout(() => setIsLoading(false), 300)
  }

  const handleSelectNumber = (phoneNumber: string) => {
    onSelectNumber(phoneNumber)
    onClose()
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-25 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl z-50 w-[calc(100vw-32px)] max-w-[700px] max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Phone className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Select Phone Number</h3>
              <p className="text-sm text-gray-500">Choose a new Twilio number for SMS communication</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Area Code Selection */}
          <div className="p-5 border-b bg-gray-50">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <MapPin className="inline h-4 w-4 mr-1 text-gray-400" />
              Select Area Code
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {AREA_CODES.map((areaCode) => (
                <button
                  key={areaCode.code}
                  onClick={() => handleAreaCodeChange(areaCode.code)}
                  className={`px-4 py-2.5 rounded-lg border-2 transition-all text-left ${
                    selectedAreaCode === areaCode.code
                      ? 'border-purple-600 bg-purple-50 text-purple-900'
                      : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <div className="font-semibold text-base">{areaCode.code}</div>
                  <div className="text-xs text-gray-600 mt-0.5 truncate">{areaCode.region}</div>
                  {areaCode.popular && (
                    <div className="mt-1">
                      <span className="inline-block px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded font-medium">
                        Popular
                      </span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="p-5 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by number or city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Available Numbers List */}
          <div className="p-5">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 text-purple-600 animate-spin" />
              </div>
            ) : filteredNumbers.length === 0 ? (
              <div className="text-center py-12">
                <Phone className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No numbers found matching your search</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium text-gray-700">
                    Available Numbers ({filteredNumbers.length})
                  </h4>
                  <span className="text-xs text-gray-500">$1.00/month per number</span>
                </div>
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                  {filteredNumbers.map((number) => (
                    <div
                      key={number.phoneNumber}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all group"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Phone className="h-4 w-4 text-purple-600" />
                          <span className="font-semibold text-gray-900 text-lg">
                            {number.friendlyName}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="inline-flex items-center gap-1 text-gray-600">
                            <MapPin className="h-3.5 w-3.5" />
                            {number.locality}, {number.region}
                          </span>
                          <div className="flex items-center gap-2">
                            {number.capabilities.voice && (
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded font-medium">
                                Voice
                              </span>
                            )}
                            {number.capabilities.sms && (
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded font-medium">
                                SMS
                              </span>
                            )}
                            {number.capabilities.mms && (
                              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded font-medium">
                                MMS
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleSelectNumber(number.friendlyName)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        Select
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-5 border-t bg-gray-50">
          <p className="text-sm text-gray-600">
            Selected area code: <span className="font-semibold text-gray-900">{selectedAreaCode}</span>
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  )
}
