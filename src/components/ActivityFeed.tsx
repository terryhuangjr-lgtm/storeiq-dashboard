import { ActivityLog } from '../lib/types'

interface ActivityFeedProps {
  activities: ActivityLog[]
}

export default function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {activity.status === 'success' && (
              <div className="w-2 h-2 bg-success rounded-full mt-1" />
            )}
            {activity.status === 'warning' && (
              <div className="w-2 h-2 bg-warning rounded-full mt-1" />
            )}
            {activity.status === 'error' && (
              <div className="w-2 h-2 bg-danger rounded-full mt-1" />
            )}
          </div>
          <div className="flex-1 pb-4 border-l-2 border-gray-100 pl-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-text text-sm">{activity.action}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 capitalize">
                {activity.status}
              </span>
            </div>
            <p className="text-secondary text-sm mb-1">{activity.summary}</p>
            {activity.details && (
              <p className="text-gray-400 text-xs">{activity.details}</p>
            )}
            <span className="text-gray-400 text-xs">
              {new Date(activity.created_at).toLocaleString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}