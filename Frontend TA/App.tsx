import { useEffect } from 'react'
import Router from './src/Router'
import React from 'react';
if (__DEV__) {
  require("./ReactotronConfig");
}

const App = () => {
  return (
    <Router />
  )
}

export default App
