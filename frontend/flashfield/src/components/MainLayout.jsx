import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const MainLayout = () => {
    return (
        <div className="bg-navy min-h-screen">
            <Navbar />
            <main>\
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default MainLayout;
