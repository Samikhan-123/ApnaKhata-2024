/* eslint-disable react/prop-types */
import { Helmet } from 'react-helmet';
import { Toaster } from 'react-hot-toast';

// Default values for props
const defaultProps = {
  title: 'ApnaKhata - Track Your Expenses',
  description: 'ApnaKhata - An accounting and expense tracking app for personal and family use.',
  keywords: 'apnaKhata, accounting, expense tracking, budget, family finance, personal finance, expenditure, expenses, budgeting, login, register, reset password',
  author: 'SK',
};

const Layout = ({
  children,
  title = defaultProps.title,
  description = defaultProps.description,
  keywords = defaultProps.keywords,
  author = defaultProps.author,
  className = '',
}) => {
  return (
    <div>
      <Helmet>
        <html lang="en" />
        <meta charSet="utf-8" />
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <meta name="author" content={author} />
        <title>{title}</title>

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content="/path-to-your-default-image.jpg" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={window.location.href} />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content="/path-to-your-default-image.jpg" />
      </Helmet>
      {/* <Header /> */}
      <main style={{ minHeight: '70vh' }} className={className}>
        <Toaster />
        {children}
      </main>
      {/* <Footer /> */}
    </div>
  );
};

export default Layout;
