import logo from './logo.svg';
import './App.css';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import AdminLogIn from './admin_page/adminLogIn';
import AdminHomePage from './admin_page/adminHomePage';
import PlayerLogIn from './home_page/playerLogIn';
import PlayerHomePage from './player_page/playerHomePage';

function App() {
  return (
    <>
      {/* This is the alias of BrowserRouter i.e. Router */}
      <BrowserRouter>
        <Switch>
          {/* This route is for home component 
          with exact path "/", in component props 
          we passes the imported component*/}
          <Route exact path="/" component={PlayerLogIn} />

          {/* This route is for home component 
          with exact path "/", in component props 
          we passes the imported component*/}
          <Route path="/player-page" component={PlayerHomePage} />

          {/* This route is for about component 
          with exact path "/about", in component 
          props we passes the imported component*/}
          <Route path="/admin" component={AdminLogIn} />

          {/* This route is for about component 
          with exact path "/about", in component 
          props we passes the imported component*/}
          <Route path="/admin-page" component={AdminHomePage} />

          {/* If any route mismatches the upper 
          route endpoints then, redirect triggers 
          and redirects app to home component with to="/" */}
          <Redirect to="/" />
        </Switch>
      </BrowserRouter>
    </>
  );
}

export default App;
