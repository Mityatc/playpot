import { Loader2 } from 'lucide-react'

const Loading = ({ message = 'Loading...', className = '' }) => {
  return (
    <div className={`flex items-center justify-center min-h-[200px] ${className}`}>
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-2" />
        <p className="text-gray-600 text-sm">{message}</p>
      </div>
    </div>
  )
}

export default Loading 