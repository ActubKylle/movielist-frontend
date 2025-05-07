// src/components/layout/Footer.js
function Footer() {
    const currentYear = new Date().getFullYear();
    
    return (
      <footer className="bg-dark text-white py-4 mt-auto">
        <div className="container text-center">
          <p className="mb-0">
            &copy; {currentYear} Movie Manager App. All rights reserved.
          </p>
          <p className="small mb-0 mt-1">
            Built with Laravel & React
          </p>
        </div>
      </footer>
    );
  }
  
  export default Footer;