// Example of route setup in the main App component
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom';
import SignUp from './components/SignUp';

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/signup" component={SignUp} />
        <Route path="/signin" component={SignIn} />
      </Switch>
    </Router>
  );
}

export default App;
