import { useState } from "react";

export default function SimpleApp() {
  const [test, setTest] = useState("Hello");

  return (
    <div className="h-screen w-screen bg-background">
      <h1>Simple Test</h1>
      <p>{test}</p>
    </div>
  );
}