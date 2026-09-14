import svgPaths from "./svg-ji31w304kr";
import imgLogout1 from "./9726c0342391342143a87902f0d97ff7ca048d04.png";
import imgDashboard1 from "./56538eb1b2f00330cfdb634873ac28bc2692aed0.png";
import imgEvaluating from "./142574935462e622c8a0197363ca6efe399c0a22.png";
import img5306453411222291363761758256220130317233290553N2 from "./bf12f785c123e6062f357708cc78ef68d7a2917a.png";

function Frame() {
  return (
    <div className="absolute bg-white border border-[#059467] border-solid drop-shadow-[0px_1px_1px_rgba(0,0,0,0.1)] h-[48px] left-[27px] rounded-[8px] top-[1016px] w-[136px]">
      <p className="-translate-x-1/2 absolute font-['Poppins:Regular',sans-serif] leading-[normal] left-[67px] not-italic text-[#059467] text-[18px] text-center top-[9.5px] tracking-[0.9px] w-[93px] whitespace-pre-wrap">{`    Logout`}</p>
      <div className="absolute left-[16px] size-[17px] top-[15px]" data-name="logout 1">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgLogout1} />
      </div>
    </div>
  );
}

function Group() {
  return (
    <div className="absolute contents left-[27px] top-[7px]">
      <p className="-translate-x-1/2 absolute font-['Poppins:Regular',sans-serif] h-[22px] leading-[normal] left-[169px] not-italic text-[18px] text-center text-white top-[13px] tracking-[0.9px] w-[108px]">Dashboard</p>
      <div className="absolute left-[27px] size-[34px] top-[7px]" data-name="dashboard (1)">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgDashboard1} />
      </div>
    </div>
  );
}

function Group3() {
  return (
    <div className="absolute contents left-0 top-0">
      <div className="absolute bg-[#059467] h-[48px] left-0 rounded-[8px] top-0 w-[294px]" />
      <Group />
    </div>
  );
}

function Cashier() {
  return (
    <div className="absolute left-[26px] size-[35px] top-[59px]" data-name="Cashier">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 35 35">
        <g clipPath="url(#clip0_1_97)" id="Cashier">
          <path d={svgPaths.p3b50eb00} fill="var(--fill-0, white)" id="Vector" />
          <path d={svgPaths.p1baa600} fill="var(--fill-0, white)" id="Vector_2" />
        </g>
        <defs>
          <clipPath id="clip0_1_97">
            <rect fill="white" height="35" width="35" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Group1() {
  return (
    <div className="absolute contents left-[26px] top-[59px]">
      <p className="-translate-x-1/2 absolute font-['Poppins:Regular',sans-serif] h-[32px] leading-[normal] left-[124px] not-italic text-[18px] text-center text-white top-[59px] tracking-[0.9px] w-[182px]">Payment</p>
      <Cashier />
    </div>
  );
}

function Group2() {
  return (
    <div className="absolute contents left-[27px] top-[111px]">
      <p className="-translate-x-1/2 absolute font-['Poppins:Regular',sans-serif] h-[22px] leading-[normal] left-[159px] not-italic text-[18px] text-center text-white top-[117px] tracking-[0.9px] w-[170px]">Payment History</p>
      <div className="absolute left-[27px] size-[34px] top-[111px]" data-name="evaluating">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgEvaluating} />
      </div>
    </div>
  );
}

export default function TreasurerDb() {
  return (
    <div className="bg-white relative size-full" data-name="Treasurer DB">
      <div className="absolute bg-[#14522d] h-[1083px] left-0 top-0 w-[321px]" />
      <Frame />
      <div className="absolute h-[145px] left-[14px] top-[117px] w-[294px]" data-name="Treasurer sidebar">
        <Group3 />
        <Group1 />
        <Group2 />
      </div>
      <div className="absolute border-[rgba(255,255,255,0.13)] border-b border-solid h-[82px] left-0 top-0 w-[321px]" data-name="Rectangle" />
      <p className="-translate-x-1/2 absolute font-['Poppins:Bold',sans-serif] h-[22px] leading-[normal] left-[170.5px] not-italic text-[18px] text-center text-white top-[19px] tracking-[0.9px] w-[159px]">Magarao Office</p>
      <p className="-translate-x-1/2 absolute font-['Poppins:Light',sans-serif] h-[22px] leading-[normal] left-[134.5px] not-italic text-[15px] text-center text-white top-[41px] tracking-[0.75px] w-[103px]">{`Tax & Fees`}</p>
      <div className="absolute bg-[#f5f7fa] h-[1083px] left-[321px] top-0 w-[1599px]" data-name="Rectangle" />
      <div className="absolute bg-white border border-[#e5e7eb] border-solid h-[178px] left-[355px] rounded-[8px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.1)] top-[117px] w-[345px]" data-name="Rectangle" />
      <div className="absolute bg-white border border-[#e5e7eb] border-solid h-[178px] left-[731px] rounded-[8px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.1)] top-[114px] w-[345px]" data-name="Rectangle" />
      <div className="absolute bg-white border border-[#e5e7eb] border-solid h-[178px] left-[1107px] rounded-[8px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.1)] top-[117px] w-[345px]" data-name="Rectangle" />
      <div className="absolute bg-white border border-[#e5e7eb] border-solid h-[595px] left-[355px] rounded-[8px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.1)] top-[330px] w-[1097px]" data-name="Rectangle" />
      <div className="absolute bg-white border border-[#e5e7eb] border-solid h-[178px] left-[1483px] rounded-[8px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.1)] top-[114px] w-[345px]" data-name="Rectangle" />
      <div className="absolute h-[58px] left-[21px] top-[12px] w-[62px]" data-name="530645341_122229136376175825_6220130317233290553_n 2">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={img5306453411222291363761758256220130317233290553N2} />
      </div>
      <div className="absolute bg-white border-[#e5e7eb] border-b border-solid h-[81px] left-[321px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.1),0px_1px_3px_0px_rgba(0,0,0,0.1),0px_0px_0px_0px_rgba(0,0,0,0),0px_0px_0px_0px_rgba(0,0,0,0),0px_0px_0px_0px_rgba(0,0,0,0),0px_0px_0px_0px_rgba(0,0,0,0)] top-px w-[1599px]" data-name="Rectangle" />
      <p className="-translate-x-1/2 absolute font-['Poppins:SemiBold',sans-serif] h-[35px] leading-[normal] left-[439px] not-italic text-[32px] text-black text-center top-[13px] tracking-[1.6px] w-[200px]">Dashboard</p>
    </div>
  );
}