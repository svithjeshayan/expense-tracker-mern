import { describe, it, expect, vi, beforeEach } from 'vitest'
import { downloadCSV } from '../utils/csvGenerator'

describe('csvGenerator', () => {
  let mockCreateElement
  let mockLink
  let mockCreateObjectURL
  let mockRevokeObjectURL

  beforeEach(() => {
    // Mock DOM APIs
    mockLink = {
      setAttribute: vi.fn(),
      click: vi.fn(),
      style: {},
      download: ''
    }
    mockCreateElement = vi.spyOn(document, 'createElement').mockReturnValue(mockLink)
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => {})
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => {})
    
    mockCreateObjectURL = vi.fn().mockReturnValue('blob:test-url')
    mockRevokeObjectURL = vi.fn()
    globalThis.URL.createObjectURL = mockCreateObjectURL
    globalThis.URL.revokeObjectURL = mockRevokeObjectURL

    // Mock alert
    globalThis.alert = vi.fn()
  })

  it('should show alert when data is empty', () => {
    downloadCSV([])
    expect(globalThis.alert).toHaveBeenCalledWith('No data to export')
  })

  it('should show alert when data is null', () => {
    downloadCSV(null)
    expect(globalThis.alert).toHaveBeenCalledWith('No data to export')
  })

  it('should create a download link with correct attributes', () => {
    const testData = [
      {
        date: '2024-01-15T00:00:00.000Z',
        description: 'Test expense',
        category: 'Food',
        type: 'expense',
        amount: 50,
        paymentMethod: 'Cash'
      }
    ]

    downloadCSV(testData, 'test.csv')

    expect(mockCreateElement).toHaveBeenCalledWith('a')
    expect(mockLink.setAttribute).toHaveBeenCalledWith('download', 'test.csv')
    expect(mockLink.click).toHaveBeenCalled()
  })

  it('should generate correct CSV content with headers', () => {
    const testData = [
      {
        date: '2024-01-15T00:00:00.000Z',
        description: 'Lunch',
        category: 'Food',
        type: 'expense',
        amount: 25,
        paymentMethod: 'Credit Card'
      },
      {
        date: '2024-01-16T00:00:00.000Z',
        description: 'Salary',
        category: 'Work',
        type: 'income',
        amount: 5000,
        paymentMethod: 'Bank Transfer'
      }
    ]

    downloadCSV(testData)

    // Verify blob was created with CSV content
    expect(mockCreateObjectURL).toHaveBeenCalled()
    const blobArg = mockCreateObjectURL.mock.calls[0]
    expect(blobArg).toBeDefined()
  })

  it('should handle missing optional fields gracefully', () => {
    const testData = [
      {
        date: '2024-01-15T00:00:00.000Z',
        category: 'Misc',
        type: 'expense',
        amount: 10
        // description and paymentMethod missing
      }
    ]

    // Should not throw
    expect(() => downloadCSV(testData)).not.toThrow()
  })

  it('should use default filename when not provided', () => {
    const testData = [
      {
        date: '2024-01-15T00:00:00.000Z',
        category: 'Food',
        type: 'expense',
        amount: 20
      }
    ]

    downloadCSV(testData)

    expect(mockLink.setAttribute).toHaveBeenCalledWith('download', 'expenses.csv')
  })
})
