import { ActivityLog } from '../lib/types'

interface ActivityFeedProps {
  activities: ActivityLog[]
}

export default function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <div key={activity.id} className="group flex gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <div className={`w-2.5 h-2.5 rounded-full shadow-sm ${
              activity.status === 'success' ? 'bg-success' :
              activity.status === 'warning' ? 'bg-warning' :
              'bg-danger'
            }`} />
          </div>
          <div className="flex-1 pb-4 border-l-2 border-gray-100 group-last:border-transparent pl-4">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-semibold text-text text-sm">{activity.action}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                activity.status === 'success' ? 'bg-success/10 text-success' :
                activity.status === 'warning' ? 'bg-warning/10 text-warning' :
                'bg-danger/10 text-danger'
              }`}>
                {activity.status}
              </span>
            </div>
            <p className="text-secondary text-sm leading-relaxed mb-1">{activity.summary}</p>
            {activity.details && (
              <p className="text-gray-400 text-xs leading-relaxed mb-1.5">{activity.details}</p>
            )}
            <span className="text-gray-300 text-xs">
              {new Date(activity.created_at).toLocaleString('en-US', {
                month: 'short', day: 'numeric',
                hour: 'numeric', minute: '2-digit',
                timeZone: 'America/New_York',
              })}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
