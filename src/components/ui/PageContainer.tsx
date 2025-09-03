import React from "react";

type PageContainerProps = {
  children: React.ReactNode;
};

const PageContainer: React.FC<PageContainerProps> = ({ children }) => {
  return (
    <div className="relative w-full h-full min-h-dvh mx-auto my-0 flex flex-col max-w-[900px]">
      {children}
    </div>
  );
};

export default PageContainer;
