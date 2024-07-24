import React, {
  createContext,
  useState,
  useContext,
  PropsWithChildren,
} from "react";
import { Notification } from ".";

const NotificationContext = createContext({
    addNotification: (title: string, message: string, type: string) => {},
    removeNotification: (id: string) => {},
});

export const useNotifications = () => useContext(NotificationContext);

interface Notification {
  id: string;
  message: string;
  type: string;
  title: string;
}

export const NotificationProvider = ({ children }: PropsWithChildren<{}>) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (
    title: string,
    message: string,
    type: string = "info"
  ) => {
    const id = Math.random().toString(36)
    console.log("Adding notification", id);
    console.log(notifications);
    setNotifications([...notifications, { id, message, type, title }]);
    // setTimeout(() => removeNotification(id), 50000);
  };

  const removeNotification = (id: string) => {
    console.log("Removing notification", id);
    console.log(notifications);
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  };

  const NotificationContainer = ({ children }: PropsWithChildren<{}>) => {
    return <div className="fixed flex flex-col gap-4 top-5 right-5 z-[1000] w-full">{children}</div>;
  };

  return (
    <NotificationContext.Provider
      value={{ addNotification, removeNotification }}
    >
      <NotificationContainer>
        {notifications.map((notification) => (
          <Notification
            key={notification.id}
            id={notification.id}
            // timeout={5000}
            message={notification.message}
            type={notification.type}
            title={notification.title}
          />
        ))}
      </NotificationContainer>
      {children}
    </NotificationContext.Provider>
  );
};
