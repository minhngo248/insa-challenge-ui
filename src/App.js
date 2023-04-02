import './App.css';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import AdminLogIn from './admin_page/adminLogIn';
import BigAdminHomePage from './admin_page/bigAdminHomePage';
import PlayerLogIn from './home_page/playerLogIn';
import PlayerHomePage from './player_page/playerHomePage';
import PlayerLoadingPage from './player_page/playerLoadingPage';
import PlayerWolfPage from './player_page/playerWolfPage';
import AdminGamePage from './admin_page/adminGamePage';
import WolfControlPage from './admin_page/wolf/wolfControlPage';

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

          <Route path="/player-loading-page" component={PlayerLoadingPage} />

          <Route path="/player-wolf-page" component={PlayerWolfPage} />

          {/* This route is for about component 
          with exact path "/about", in component 
          props we passes the imported component*/}
          <Route path="/admin" component={AdminLogIn} />

          {/* This route is for about component 
          with exact path "/about", in component 
          props we passes the imported component*/}
          <Route path="/big-admin-page" component={BigAdminHomePage} />

          {/* This route is for about component 
          with exact path "/about", in component 
          props we passes the imported component*/}
          <Route path="/admin-game-page" component={AdminGamePage} />

          <Route path="/wolf-page" component={WolfControlPage} />

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
