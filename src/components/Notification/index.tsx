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
    <div className="">
      <div className="flex items-start">
        <div className="ml-3 w-0 flex-1 pt-0.5">
          <p className="text-sm font-medium text-gray-900">{data.title}</p>
          <p className="mt-1 text-sm text-gray-500">{data.message}</p>
        </div>
      </div>
    </div>
  );
};
