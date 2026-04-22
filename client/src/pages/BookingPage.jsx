import BookingForm from "../components/BookingForm";

const BookingPage = () => {
  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">
        Create Booking
      </h1>

      <BookingForm />
    </div>
  );
};

export default BookingPage;