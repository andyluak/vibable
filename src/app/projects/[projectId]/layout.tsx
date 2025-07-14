import React from "react";

type Props = {
  children: React.ReactNode;
};

function Layout({ children }: Props) {
  return <div className='pt-14'>{children}</div>;
}

export default Layout;
