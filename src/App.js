import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomeScreen from './screens/HomeScreen';
import AuthScreen from './screens/AuthScreen';
import ProfileEditor from './screens/ProfileEditor';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/login" element={<AuthScreen />} />
        <Route path="/perfil" element={<ProfileEditor />} />
      </Routes>
    </Router>
  );
}

export default App;