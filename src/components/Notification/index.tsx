import { ToastContentProps } from "react-toastify";

export interface NotificationProps {
  message: string;
  type: string;
  title: string;
}

export const Notification = ({
  data,
}: ToastContentProps<NotificationProps>) => {
  return (
    <div className="min-w-0">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1 pt-0.5">
          <p className="text-sm font-medium text-gray-900">{data.title}</p>
          <p className="mt-1 text-sm text-gray-500 break-words">{data.message}</p>
        </div>
      </div>
    </div>
  );
};
