import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './extra.css';
import reportWebVitals from './reportWebVitals';

const DEFAULT_STATE = {
  break: 5, // 5 will be int 1-60 inclusive
  session: 25, // 25 will be int 1-60 inclusive
  timer: 1500000, // ms value time calculated based on session initially
  running: false, // is clock running
  running_type: "Session", // string value of "Session" or "Break" depending on which timer is running
  start: 0, // ms value time of the time clock started running (seconds since epoch)
  last_iter: 0 // ms value time of the last iteration while the clock is running (seconds since epoch)
}


const LOGGING = false

function App() {
  const [myState, setMyState] = React.useState({...DEFAULT_STATE});
  
  return (
    <div id="main-wrap">
      <h1>25 + 5 Clock</h1>
      
      <div id="config-wrap">
        <div id="break-wrap">
          <div className="heading" id="break-label">Break Length</div>
          <div id="break-length-wrap">
            {Button("break-decrement", "fa-solid fa-caret-down", myState, setMyState)}
            <div id="break-length">{myState.break}</div>
            {Button("break-increment", "fa-solid fa-caret-up", myState, setMyState)}
          </div>
        </div>
        
        <div id="session-wrap">
          <div className="heading" id="session-label">Session Length</div>
          <div id="session-length-wrap">
            {Button("session-decrement", "fa-solid fa-caret-down", myState, setMyState)}
            <div id="session-length">{myState.session}</div>
            {Button("session-increment", "fa-solid fa-caret-up", myState, setMyState)}
          </div>
        </div>
      </div>
      
      <div id="timer-wrap">
        <div id="timer-label">{myState.running_type}</div>
        {myState.running ? <Timervalue myState={myState} setMyState={setMyState} /> : <div id="time-left">{minSec(myState.timer)}</div>} 
      </div>
      
      <div id="controls-wrap">
          {Button("start_stop", myState.running ? "fa-solid fa-pause" : "fa-solid fa-play", myState, setMyState)}
          {Button("reset", "fa-solid fa-arrows-rotate", myState, setMyState)}
      </div>
      
      <audio id="beep" preload="auto" src="https://cdn.freecodecamp.org/testable-projects-fcc/audio/BeepSound.wav"></audio>
      
    </div>
  )
}

function Timervalue(props) {
  // here is our main timer hook
  useTimer(props.myState, props.setMyState)
  
  const display_timer = minSec(props.myState.timer)
  
  if (display_timer === '00:00') {
    document.getElementById("beep").play();
  }
  
  return (
    <div id="time-left" className="started">
      {display_timer}
    </div>
  )
}

function Button(id, fa_classes, myState, setMyState) {
  return (
    <div>
      <i id={id} className={fa_classes} onClick={(e) => clickHandler(e, myState, setMyState)}></i>
    </div>
  )
}

function clickHandler(event, myState, setMyState) {
  let ret_obj = {...myState}
  
  // handle incrementing and decrementing of the session/break state values
  switch (event.target.id) {
    case 'break-decrement':
      if (ret_obj.break > 1) {
        ret_obj.break -= 1;
      }
      break;
      
    case 'break-increment':
      if (ret_obj.break < 60) {
        ret_obj.break += 1;
      } 
      break;
      
    case 'session-decrement':
      if (ret_obj.session > 1) {
        ret_obj.session -= 1;
        ret_obj.timer = ret_obj.session*1000*60;
      }
      break;
      
    case 'session-increment':
      if (ret_obj.session < 60) {
        ret_obj.session += 1;
        ret_obj.timer = ret_obj.session*1000*60;
      }
      break;
      
    case 'reset':
      ret_obj = {...DEFAULT_STATE};
      stop_beep();
      break;
      
    case 'start_stop':
      if (ret_obj.running) {
        stop_beep();
        ret_obj.running = false;
      }
      else {
        const now = new Date().getTime();
        ret_obj.start = now;
        ret_obj.last_iter = now;
        ret_obj.running = true;
      }
      break;
    default:
      break;
  }
  
  setMyState(ret_obj)
  logme('current state: ', myState)
}

// if beep is playing stop and rewind to start
function stop_beep() {
  /*
  beep = document.getElementById("beep")
  if (!beep.paused) {
    beep.pause();
    beep.fastSeek(0);
  
  }
  */
}

// take a millisecond value and return a string in the format of mm:ss
function minSec(milliseconds) {
  let elapsed_mins = Math.floor((milliseconds/1000)/60).toString().padStart(2, '0');
  if (elapsed_mins < 0) { elapsed_mins = '00' };
  let elapsed_secs = Math.round((milliseconds/1000)%60).toString().padStart(2, '0');
  if (elapsed_secs < 0) { elapsed_secs = '00' };
  let ret_str = `${elapsed_mins}:${elapsed_secs}`;
  logme(ret_str);
  return ret_str;
}

// return a string of seconds and milliseconds at nows time
function logtime() {
  const now = new Date();
  const logtime = `${now.getSeconds()}:${now.getMilliseconds()}`  
  return logtime
}

function logme(...args) {
  if (LOGGING) {
    console.log(logtime(), ...args)
  }
}

// our main useEffect timer hook
function useTimer(myState, setMyState) {
  //logme('===========================enter')
  
  React.useEffect(() => {
    
    // use setinterval which runs concurrently, first it will wait the delay of 1000 ms
    // then it will run the function infinitely after the delay each time
    // we return a cleanup function to cleanup each setinterval or they run infinitely
    
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const ret_obj = {...myState};
      const elapsed_this_iter = now - myState.last_iter;
      
      logme('delta since last iter: ', elapsed_this_iter)
      
      // handle swapping back and forth between timer types
      if (ret_obj.timer <= 0) {
        switch (ret_obj.running_type) {
          case "Session":
            //convert min to ms
            const required_break_length = ret_obj.break*1000*60;

            ret_obj.timer = required_break_length;
            ret_obj.running_type = "Break";
            break;
          case "Break":
            //convert min to ms
            const required_session_length = ret_obj.session*1000*60;
            ret_obj.timer = required_session_length;
            ret_obj.running_type = "Session";
            break;
          default:
            break;
        }
        ret_obj.start = now;
      }

      else {
        ret_obj.timer -= elapsed_this_iter;
      }
      
      ret_obj.last_iter = now;
      
      logme('setting mystate: ', ret_obj)
      
      setMyState(ret_obj);
      
    }, 1000);
    
    //logme('current interval: ', interval)
    
    return () => {
              //logme('kill interval: ', interval)
              clearInterval(interval)
           }
    
  }, [myState, setMyState])
  
  
  
  //logme('exiting hook: ', myState);
  //logme('===========================exit')
  return
}


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <div>
    <React.StrictMode></React.StrictMode>
    <App />
  </div>
  

);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
