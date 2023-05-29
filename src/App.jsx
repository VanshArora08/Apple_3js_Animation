import Nav from "./components/nav";
import Jumbotron from "./components/jumbotron";
import SoundSection from "./components/SoundSection";
import Display from "./components/display";
import WebGiViewer from "./components/WebGiViewer";
import { useRef } from "react";
function App() {
  const webGiRef = useRef()
  const contentRef = useRef()
  const handlePreview = () => {
    webGiRef.current.triggerPreview();
  }
  return (
    <div className="App">
      <div id="content" ref={contentRef}>
        <Nav />
        <Jumbotron />
        <SoundSection />
        <Display triggerPreview={handlePreview} />
      </div>

      <WebGiViewer contentRef={contentRef} ref={webGiRef} />

    </div>
  );
}

export default App;
