import logo from './logo.svg';
import './App.css';
import Chat from './Chat/Chat'
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';

function App() {
  return (
      <Router>
          <Switch>
            <Route exact path="/chat" component={Chat}/>
            <Route path="*">
                <Chat/>
            </Route>
          </Switch>
      </Router>  );
}

export default App;
