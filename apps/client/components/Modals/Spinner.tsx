const Spinner = () => {
  return (
    <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center bg-[#00000080]">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white"></div>
    </div>
  );
};

export default Spinner;
