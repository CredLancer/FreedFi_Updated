'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRef } from 'react';
import BackLogo from '@/assets/LeftGrayArrow.svg';
import Image from 'next/image';
import RightArrow from '@/assets/RightArrow.svg';
import { useDispatch, useSelector } from 'react-redux';
import toast, { Toaster } from 'react-hot-toast';
import BlackTick from '@/assets/BlackTick.svg';
import BlackDownArrow from '@/assets/BlackDownArrow.svg';
import SeekersProof from '../../../components/SeekersProof';
import SeekersProgress from '../../../components/SeekersProgress';
import SeekersAdditionalProof from '../../../components/SeekersAdditionalProof';
import { useRouter } from 'next/navigation';
import { uiActions } from '@/store/ui-slice';
const alchemyKey = process.env.NEXT_PUBLIC_XDC_URL;
const { createAlchemyWeb3 } = require('@alch/alchemy-web3');
const web3 = createAlchemyWeb3(alchemyKey);
const contractAddress = '0xF9A67C9df887dcBEBe92AFE8Ad99DC67b2D84fE1';
const contractABI = [
  {
    type: 'constructor',
    inputs: [{ name: '_trader', type: 'address', internalType: 'address' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'addInvester',
    inputs: [{ name: 'lender', type: 'address', internalType: 'address' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'borrowApprove',
    inputs: [
      { name: 'borrower', type: 'address', internalType: 'address payable' },
      { name: 'amount', type: 'uint256', internalType: 'uint256' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'borrowRequest',
    inputs: [
      { name: 'borrower', type: 'address', internalType: 'address payable' },
      { name: 'requestedAmount', type: 'uint256', internalType: 'uint256' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'borrowedAmounts',
    inputs: [
      { name: '', type: 'address', internalType: 'address' },
      { name: '', type: 'address', internalType: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getBorrowedAmount',
    inputs: [
      { name: 'lender', type: 'address', internalType: 'address payable' },
    ],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getInvesters',
    inputs: [{ name: 'lender', type: 'address', internalType: 'address' }],
    outputs: [{ name: '', type: 'bool', internalType: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'hasActiveLoan',
    inputs: [{ name: '', type: 'address', internalType: 'address' }],
    outputs: [{ name: '', type: 'bool', internalType: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'investers',
    inputs: [{ name: '', type: 'address', internalType: 'address' }],
    outputs: [{ name: '', type: 'bool', internalType: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'market',
    inputs: [
      { name: '', type: 'address', internalType: 'address' },
      { name: '', type: 'uint256', internalType: 'uint256' },
    ],
    outputs: [
      { name: '', type: 'uint8', internalType: 'enum LendingPlatform.Status' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'repay',
    inputs: [
      { name: 'lender', type: 'address', internalType: 'address payable' },
      { name: 'borrower', type: 'address', internalType: 'address payable' },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'setPoolController',
    inputs: [{ name: 'pool', type: 'address', internalType: 'address' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'trader',
    inputs: [],
    outputs: [{ name: '', type: 'address', internalType: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'event',
    name: 'Borrowed',
    inputs: [
      {
        name: 'lender',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'borrower',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'amount',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'Repaid',
    inputs: [
      {
        name: 'lender',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'borrower',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'amount',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
];

const Onboarding = () => {
  const dispatch = useDispatch();
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const router = useRouter();
  const targetRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [loanAmount, setLoanAmount] = useState([1]); // State as an array
  const [showModal, setShowModal] = useState(false);

  const handelSubmit = async () => {
    window.contract = await new web3.eth.Contract(contractABI, contractAddress);
    const loanAmountWei = web3.utils
      .toBN(Number(loanAmount))
      .mul(web3.utils.toBN('1000000000000000000'));
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    router.push('/dashboard');
    const selectedAddress = accounts[0];
    const transactionParameters = {
      to: contractAddress, // Required except during contract publications.
      from: selectedAddress, // must match user's active address.
      data: window.contract.methods
        .borrowRequest(selectedAddress, loanAmountWei)
        .encodeABI(), //make call to NFT smart contract
    };

    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [transactionParameters],
    });
    console.log(txHash);
    dispatch(uiActions.toggleConfetti(true));
  };

  const handleSliderChange = (value) => {
    setLoanAmount(value); // Directly use the array value
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const nextPanel = (e) => {
    e.preventDefault();

    if (index < 2) {
      setIndex(index + 1);
      targetRef.current.scrollLeft += 740;
      setDirection(1);
    }

    if (index == 2) {
      setShowModal(true);
    }
  };

  const prevPanel = (e) => {
    e.preventDefault();

    if (index === 1) {
      checkLinkedInUrl();
    }

    if (index > 0) {
      setIndex(index - 1);
      targetRef.current.scrollLeft -= 740;
      setDirection(-1);
    }
  };

  const handleScroll = (e) => {
    if (isMobile) {
      e.preventDefault();
    }
  };

  return (
    <div
      className={` ${
        showModal
          ? 'overflow-hidden lg:p-0'
          : 'w-full lg:pt-[2.75rem] lg:pb-[4rem]'
      }   `}>
      {/* Logo */}

      {/* Mobile nav bar */}
      <div className="h-[60px] lg:hidden px-4 w-full  shadow-nav sticky top-0 left-0 z-[50] flex items-center justify-between mb-2">
        <div className="flex-1 flex justify-start">
          <Image
            onClick={prevPanel}
            src={BlackDownArrow}
            alt="back"
            className={`h-[1.5rem] w-fit rotate-90 cursor-pointer transition-all duration-300 ${
              index > 0 ? 'block opacity-[100%]' : 'hidden opacity-0'
            }`}
          />
        </div>
        <div className="flex gap-1 flex-1 justify-center">
          <div
            className={`w-4 h-[3px] rounded-full   ${
              index > 0 ? 'bg-black' : 'bg-light-gray'
            }`}></div>
          <div
            className={`w-4 h-[3px] rounded-full   ${
              index > 1 ? 'bg-black' : 'bg-light-gray'
            }`}></div>
          <div
            className={`w-4 h-[3px] rounded-full   ${
              index > 2 ? 'bg-black' : 'bg-light-gray'
            }`}></div>
        </div>
        <div className="flex-1  flex justify-end">
          <button
            onClick={nextPanel}
            className="py-[10px] w-fit  px-8 text-[0.875rem] rounded font-semibold bg-primary-button text-primary-text hover:bg-secondary-button hover:-translate-y-0.5  hover:shadow-button ease-in-out-expo transform transition-transform duration-150 cursor-pointer">
            Next
          </button>
        </div>
      </div>
      <Toaster />
      <div
        className="max-w-[62.5rem]  bg-white py-[2.75rem] shadow-onboard overflowx-x-hidden mx-auto relative rounded-[1.5rem]"
        onScroll={handleScroll}>
        <div
          ref={targetRef}
          className="max-w-[52.125rem] w-full mx-auto overflow-x-clip scrollbar-hide ">
          {/* Back button */}
          <div className="hidden lg:block">
            <div
              onClick={prevPanel}
              className={`absolute ${
                index > 0 ? 'block' : 'hidden'
              } top-[3rem] left-[3rem] cursor-pointer`}>
              <Image
                src={BackLogo}
                alt="back"
                className="w-[0.625rem] h-[1rem]"
              />
            </div>
            {/* Header */}
            <div className="w-full grid grid-cols-3 justify-center">
              <span
                className={`text-[0.75rem] text-left leading-[150%] transition-all duration-300  text-primary-text ${
                  index == 0 && 'font-semibold'
                }`}>
                Add Contracts & Address
              </span>
              <span
                className={`text-[0.75rem]  text-center leading-[150%] transition-all duration-300  text-primary-text ${
                  index == 1 && 'font-semibold'
                }`}>
                Add Social Proofs
              </span>
              <span
                className={`text-[0.75rem] text-right leading-[150%] items-end transition-all duration-300 text-primary-text ${
                  index == 2 && 'font-semibold'
                }`}>
                Review Progress
              </span>
            </div>
            <hr className=" w-full bg-gray-hover h-[1px] mt-[1.5rem] mb-[2.25rem] mx-auto" />
          </div>

          {/* Slides */}
          <AnimatePresence initial={false} custom={index} mode={`wait`}>
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 300 * direction }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}>
              {index === 0 && <SeekersProof />}
              {index === 1 && <SeekersAdditionalProof />}
              {index === 2 && (
                <SeekersProgress
                  loanAmount={loanAmount}
                  setLoanAmount={setLoanAmount}
                  handleSliderChange={handleSliderChange}
                />
              )}
            </motion.div>
          </AnimatePresence>
          <div className="hidden w-full mt-[2rem] lg:flex justify-center">
            <button
              onClick={nextPanel}
              className="max-w-[13.25rem]   mx-auto  bg-primary-button px-4 rounded font-semibold text-[0.875rem] h-[2.5rem] flex items-center gap-2 hover:bg-secondary-button hover:-translate-y-0.5  hover:shadow-button ease-in-out-expo transform transition-transform duration-150 cursor-pointer">
              {index == 2 ? 'Complete Loan' : 'Save and Continue'}
              <Image
                src={index == 2 ? BlackTick : RightArrow}
                alt="back"
                className="h-[0.875rem] w-fit"
              />
            </button>
          </div>
        </div>
      </div>
      {showModal && (
        <div className="absolute top-0 left-0 max-w-screen max-h-screen w-full h-full bg-geay-200 backdrop-blur-sm flex items-center justify-center">
          <div className="w-[520px] h-[300px] bg-gray-100 border rounded-lg p-10 border-[#AF6DEA]">
            <h1 className="text-2xl text-center">
              Would you like the confrim the Loan for
            </h1>
            <h1 className="bg-[#af6dea] mt-10 w-fit mx-auto text-white text-5xl font-bold">
              {loanAmount} ETH
            </h1>
            <div className="w-full flex justify-center">
              <button
                onClick={handelSubmit}
                className="text-[#0e0e0e] rounded-md mt-10 mx-auto z-10 bg-[#C9F270]  hover:bg-[#DAF996] hover:scale-[103%]  py-2 hover:-translate-y-0.5  hover:shadow-button px-10 ease-in-out-expo transform transition-transform duration-150 cursor-pointer">
                confrim
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Onboarding;
