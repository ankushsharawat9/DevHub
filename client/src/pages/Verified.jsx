import { Link } from 'react-router-dom';

const Verified = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50 px-4">
      <div className="bg-white p-6 rounded-xl shadow-md text-center max-w-md w-full">
        <h2 className="text-2xl font-bold text-green-600 mb-4">🎉 Email Verified!</h2>
        <p className="text-gray-700 mb-6">
          Your email address has been successfully verified. You can now log in to your account.
        </p>
        <Link
          to="/login"
          className="inline-block bg-green-600 text-white px-5 py-2 rounded-lg shadow hover:bg-green-700 transition"
        >
          Go to Login
        </Link>
      </div>
    </div>
  );
};

export default Verified;
