export default function Navbar() {
  return (
    <nav className="flex justify-between p-4 bg-black text-white">
      <h1 className="text-xl font-bold">Food Booking</h1>

      <div className="space-x-4">
        <a href="/">Home</a>
        <a href="/menu">Menu</a>
        <a href="/orders">Orders</a>
        <a href="/login">Login</a>
      </div>
    </nav>
  );
}
