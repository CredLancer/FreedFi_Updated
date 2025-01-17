import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Input from '../components/Input';
import InputField from '../components/InputField';
import { Button } from '@/components/ui/button';

export default function SeekersProof() {
  const router = useRouter();

  const [credentialWalletAddress, setCredentialWalletAddress] = useState('');
  const [isEmptyCredentialWalletAddress, setIsEmptyCredentialWalletAddress] =
    useState(false);
  const [contractAddress, setContractAddress] = useState([
    { id: 0, address: '' },
  ]);

  const addContractAddress = () => {
    setContractAddress((prev) => [...prev, { id: prev.length, address: '' }]);
  };

  const removeContractAddress = (id) => {
    setContractAddress((prev) =>
      prev.length > 1 ? prev.filter((addr) => addr.id !== id) : prev
    );
  };

  const handleAddressChange = (id, newValue) => {
    setContractAddress((prev) =>
      prev.map((addr) =>
        addr.id === id ? { ...addr, address: newValue } : addr
      )
    );
  };

  return (
    <div className="max-w-4xl mx-auto py-4 px-6">
      <h1 className="text-3xl font-bold text-center mb-4">
        Apply for the Loan
      </h1>
      <p className="text-center mb-8">
        Complete the 2 steps to apply for the loan
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 shadow rounded w-full">
          <InputField
            inputValue={credentialWalletAddress}
            setInputValue={setCredentialWalletAddress}
            isEmpty={isEmptyCredentialWalletAddress}
            setIsEmpty={setIsEmptyCredentialWalletAddress}
            label="Add Skill Credential Vault address *"
            errorMessage="Credential Vault Address Is Empty"
          />
        </div>
        <div className="bg-white p-6 shadow rounded">
          {contractAddress.map((contract) => (
            <Input
              key={contract.id}
              label="Contract Address"
              inputValue={contract.address}
              setInputValue={(newValue) =>
                handleAddressChange(contract.id, newValue)
              }
              removeFunc={removeContractAddress}
              remove={contractAddress.length > 1}
              id={contract.id}
            />
          ))}
          <Button
            onClick={addContractAddress}
            className="w-full hover:-translate-y-1 transition-all duration-200 ease-in-out-expo hover:shadow-button"
            variant="secondary">
            + Add
          </Button>
        </div>
      </div>
    </div>
  );
}
