const EmailVerified = () => {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Email Verified ✅</h1>
      <p>You may now log in.</p>
      <a href="/login">
        <button>Go to Login</button>
      </a>
    </div>
    
  );
};

export default EmailVerified;
