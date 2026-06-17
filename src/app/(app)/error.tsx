'use client'

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Có lỗi xảy ra</h1>
        <p className="text-gray-500 mb-6">
          {error.message.includes('Prisma') ? 'Lỗi kết nối cơ sở dữ liệu. Vui lòng thử lại.' : 'Đã xảy ra lỗi không mong muốn.'}
        </p>
        <button onClick={reset}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition">
          Thử lại
        </button>
      </div>
    </div>
  )
}
