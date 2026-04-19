import BookingForm from "../components/BookingForm";

const BookingPage = () => {
  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold">My Bookings</h1>
          <p className="text-gray-500">
            Manage your resource reservations
          </p>
        </div>

      </div>

      
      <BookingForm userId={1} />
    </div>
  );
};

export default BookingPage;