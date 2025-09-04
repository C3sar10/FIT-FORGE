"use client";
import MainHeader from "@/components/ui/MainHeader";
import PageContainer from "@/components/ui/PageContainer";
import React from "react";

type Props = {};

const page = (props: Props) => {
  return (
    <PageContainer>
      <MainHeader hasDetails={false} />
      <div>hello sign up</div>
    </PageContainer>
  );
};

export default page;
