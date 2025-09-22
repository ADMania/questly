"use client";

export default function BackgroundBlobs() {
  return (
    <>
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#FFCAD4] rounded-full blur-[160px] opacity-70 animate-float-slow"></div>
      <div className="absolute top-[20%] right-[-15%] w-[600px] h-[600px] bg-[#B0D0D3] rounded-full blur-[180px] opacity-60 animate-float-medium"></div>
      <div className="absolute bottom-[10%] left-[15%] w-[450px] h-[450px] bg-[#FF91A4] rounded-full blur-[160px] opacity-60 animate-float-fast"></div>
      <div className="absolute bottom-[-20%] right-[25%] w-[500px] h-[500px] bg-[#A3D5FF] rounded-full blur-[150px] opacity-70 animate-float-slow"></div>
      <div className="absolute top-[50%] left-[5%] w-[400px] h-[400px] bg-[#FFCAD4] rounded-full blur-[140px] opacity-60 animate-float-medium"></div>
      <div className="absolute bottom-[40%] right-[10%] w-[450px] h-[450px] bg-[#B0D0D3] rounded-full blur-[140px] opacity-60 animate-float-fast"></div>
    </>
  );
}
