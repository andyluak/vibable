import { Safari } from "@/components/magicui/safari";
import { TFragment } from "@/db/schema";
import React, { useState } from "react";

type FragmentWebProps = {
  data: TFragment;
};

export const FragmentWeb = ({ data }: FragmentWebProps) => {
  const [fragmentKey, setFragmentKey] = useState(0);
  return (
    <div className='flex flex-col w-full h-full'>
      <div>
        <Safari
          mode='simple'
          url={data.sandboxUrl}
          className='size-full'
          onRefresh={() => {
            setFragmentKey((prev) => prev + 1);
          }}
        />
        <iframe
          key={fragmentKey}
          src={data.sandboxUrl}
          className='w-full h-full'
          loading='lazy'
          sandbox='allow-scripts allow-same-origin allow-forms'
        />
      </div>
    </div>
  );
};
