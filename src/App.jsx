import { useState } from "react";

import {
  Navbar,
  Footer,
  Transactions,
  Services,
  Welcome,
  Loader,
} from "./components";

const App = () => {
  return (
    <div>
      <div className="min-h-screen">
        <div className="gradient-bg-welcome">
          <Navbar />
          <Welcome />
        </div>
        <Services />
        <Transactions />
        <Footer />
      </div>
    </div>
  );
};

export default App;
