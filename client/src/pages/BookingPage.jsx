import BookingForm from "../components/BookingForm";

const BookingPage = () => {
  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Create Booking</h1>
        <p className="text-gray-500">
          Reserve your resources easily
        </p>
      </div>

      <BookingForm />
    </div>
  );
};

export default BookingPage;