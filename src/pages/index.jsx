import Layout from "./Layout.jsx";

import Home from "./Home";

import About from "./About";

import Publications from "./Publications";

import Events from "./Events";

import Research from "./Research";

import Teaching from "./Teaching";

import Blog from "./Blog";

import Podcast from "./Podcast";

import Gallery from "./Gallery";

import Contact from "./Contact";

import Privacy from "./Privacy";

import Terms from "./Terms";

import BlogPost from "./BlogPost";

import Admin from "./Admin";

import Unsubscribe from "./Unsubscribe";

import Documentation from "./Documentation";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Home: Home,
    
    About: About,
    
    Publications: Publications,
    
    Events: Events,
    
    Research: Research,
    
    Teaching: Teaching,
    
    Blog: Blog,
    
    Podcast: Podcast,
    
    Gallery: Gallery,
    
    Contact: Contact,
    
    Privacy: Privacy,
    
    Terms: Terms,
    
    BlogPost: BlogPost,
    
    Admin: Admin,
    
    Unsubscribe: Unsubscribe,
    
    Documentation: Documentation,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Home />} />
                
                
                <Route path="/Home" element={<Home />} />
                
                <Route path="/About" element={<About />} />
                
                <Route path="/Publications" element={<Publications />} />
                
                <Route path="/Events" element={<Events />} />
                
                <Route path="/Research" element={<Research />} />
                
                <Route path="/Teaching" element={<Teaching />} />
                
                <Route path="/Blog" element={<Blog />} />
                
                <Route path="/Podcast" element={<Podcast />} />
                
                <Route path="/Gallery" element={<Gallery />} />
                
                <Route path="/Contact" element={<Contact />} />
                
                <Route path="/Privacy" element={<Privacy />} />
                
                <Route path="/Terms" element={<Terms />} />
                
                <Route path="/BlogPost" element={<BlogPost />} />
                
                <Route path="/Admin" element={<Admin />} />
                
                <Route path="/Unsubscribe" element={<Unsubscribe />} />
                
                <Route path="/Documentation" element={<Documentation />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}