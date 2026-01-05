import React from "react";

interface Counter {
  icon: React.ReactNode;
  number?: number;
  name: string;
}

function Counter({ icon, name, number }: Counter) {
  return (
    <div>
      <div className="flex gap-6">
        <span className="content-end text-yevox-primary">
          {icon}
        </span>
        <span className="text-5xl font-light">{number}</span>
      </div>
      <div className="text-lg font-light">{name}</div>
    </div>
  );
}

export default Counter;
