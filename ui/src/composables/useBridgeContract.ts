'use client'
import { useMemo, useState } from 'react';
import { StarknetBridgeLords as L1_BRIDGE_ABI } from '@/abi/L1/StarknetBridgeLords'

import { useAccount as useL1Account, useContractWrite as useL1ContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi';
import { } from 'wagmi'
import { tokens, ChainType } from '@/constants/tokens';
import { useContractWrite as useL2ContractWrite } from '@starknet-react/core';
import { cairo, uint256 } from 'starknet';

export const useBridgeContract = () => {
    const [amount, setAmount] = useState("");
    const { address: addressL1 } = useL1Account();
    const network =
        process.env.NEXT_PUBLIC_IS_TESTNET === "true" ? "GOERLI" : "MAIN";
    const l1BridgeAddress = tokens.L1.LORDS.bridgeAddress?.[ChainType.L1[network]]
    const l2BridgeAddress = tokens.L2.LORDS.bridgeAddress?.[ChainType.L2[network]]

    /* const { config: depostConfig } = usePrepareContractWrite({
         address: l1BridgeAddress as `0x${string}`,
         abi: L1_BRIDGE_ABI,
         functionName: "deposit",
         enabled: Boolean(addressL1),
     });*/

    const { writeAsync: deposit, data: depositData, error: depositError } = useL1ContractWrite({
        address: l1BridgeAddress as `0x${string}`,
        abi: L1_BRIDGE_ABI,
        functionName: "deposit",
    })
    const { data: depositReceipt, isLoading, status: depositTxStatus, isSuccess: depositIsSuccess, isError: depostTxError } = useWaitForTransaction({
        hash: depositData?.hash,
    })

    const { writeAsync: withdraw, error: withdrawError } = useL1ContractWrite({
        address: l1BridgeAddress as `0x${string}`,
        abi: L1_BRIDGE_ABI,
        functionName: "withdraw",
    })
    const { data: withdrawReceipt, isSuccess: withdrawIsSuccess, isError: withdrawTxError } = useWaitForTransaction({
        hash: depositData?.hash,
    })

    const calls = useMemo(() => {
        return {
            contractAddress: l2BridgeAddress,
            entrypoint: 'initiate_withdrawal',
            calldata: [addressL1 || 0, amount, 0] // Fix with proper u256 (low,high) types
        }
    }, [addressL1, amount, l2BridgeAddress])

    const { write: initiateWithdraw, data: withdrawHash } = useL2ContractWrite({ calls })

    return {
        amount,
        calls,
        setAmount,
        deposit,
        depositData,
        depositIsSuccess,
        error: depositError || depostTxError,
        depositTxStatus,
        depositReceipt,
        //depositEth,
        withdraw,
        withdrawError,
        withdrawReceipt,
        withdrawIsSuccess,
        initiateWithdraw,
        withdrawHash
    };
};