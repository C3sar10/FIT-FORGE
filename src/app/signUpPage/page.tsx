"use client";
import MainHeader from "@/components/ui/MainHeader";
import PageContainer from "@/components/ui/PageContainer";
import React from "react";

type Props = {};

const page = (props: Props) => {
  return (
    <PageContainer>
      <MainHeader hasDetails={false} />
      <div className="w-full p-4 pt-8 lg:pt-12 flex flex-col items-center">
        <h1 className="text-2xl md:text-3xl xl:text-4xl text-center">
          Welcome to FitForge
        </h1>
        <p className="py-4 leading-0.5">
          Register now to start your health & fitness journey with us.
        </p>
      </div>
    </PageContainer>
  );
};

export default page;
