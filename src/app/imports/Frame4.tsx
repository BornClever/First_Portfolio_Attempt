import { imgEllipse14 } from "./svg-fk2ld";

function Group12() {
  return (
    <div className="absolute contents left-1.5 top-[5px]">
      <div className="absolute bg-[dimgrey] left-1.5 size-[3.111px] top-[5px]" />
      <div className="absolute bg-[dimgrey] left-1.5 size-[3.111px] top-[9.67px]" />
      <div className="absolute bg-[dimgrey] left-1.5 size-[3.111px] top-[14.33px]" />
      <div className="absolute bg-[dimgrey] left-[11.44px] size-[3.111px] top-[5px]" />
      <div className="absolute bg-[dimgrey] left-[11.44px] size-[3.111px] top-[9.67px]" />
      <div className="absolute bg-[dimgrey] left-[11.44px] size-[3.111px] top-[14.33px]" />
      <div className="absolute bg-[dimgrey] left-[16.89px] size-[3.111px] top-[5px]" />
      <div className="absolute bg-[dimgrey] left-[16.89px] size-[3.111px] top-[9.67px]" />
      <div className="absolute bg-[dimgrey] left-[16.89px] size-[3.111px] top-[14.33px]" />
    </div>
  );
}

function Frame5() {
  return (
    <div className="absolute bg-[#ececec] h-[23px] left-[511px] overflow-clip rounded-[2px] top-[70px] w-[30px]">
      <Group12 />
    </div>
  );
}

function Group13() {
  return (
    <div className="absolute contents left-[551px] top-[77px]">
      <div className="absolute bg-[#d9d9d9] h-px left-[555px] top-[77px] w-[15px]" />
      <div className="absolute bg-[#d9d9d9] h-px left-[555px] top-[81px] w-[15px]" />
      <div className="absolute bg-[#d9d9d9] h-px left-[555px] top-[85px] w-[15px]" />
      <div className="absolute bg-[#d9d9d9] h-px left-[551px] top-[85px] w-0.5" />
      <div className="absolute bg-[#d9d9d9] h-px left-[551px] top-[81px] w-0.5" />
      <div className="absolute bg-[#d9d9d9] h-px left-[551px] top-[77px] w-0.5" />
    </div>
  );
}

export default function Frame4() {
  return (
    <div className="bg-white overflow-clip relative rounded-[18px] size-full">
      <Frame5 />
      <div className="absolute h-[54px] left-0 top-0 w-[613px]">
        <div aria-hidden="true" className="absolute border-[0px_0px_1px] border-black border-solid bottom-[-0.5px] left-0 pointer-events-none right-0 top-0" />
      </div>
      <div className="absolute left-6 size-[18px] top-5">
        <img className="block max-w-none size-full" src={imgEllipse14} />
      </div>
      <div className="absolute left-14 size-[18px] top-5">
        <img className="block max-w-none size-full" src={imgEllipse14} />
      </div>
      <div className="absolute left-[87px] size-[18px] top-5">
        <img className="block max-w-none size-full" src={imgEllipse14} />
      </div>
      <div className="absolute bg-[#d9d9d9] h-[175px] left-[41px] top-[99px] w-[146px]" />
      <div className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[0] left-[76px] not-italic text-[12px] text-black text-nowrap top-[283px]">
        <p className="leading-[normal] whitespace-pre">Resume.jpg</p>
      </div>
      <div className="absolute h-[25px] left-[510px] top-[69px] w-16">
        <div aria-hidden="true" className="absolute border border-black border-solid inset-0 pointer-events-none" />
      </div>
      <Group13 />
    </div>
  );
}