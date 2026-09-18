"use client";

import { useEffect, useState } from "react";

import { getEmployeeDistributionData } from "@/store/customer"; // Your API function
import DonutChartCard from "./DonutChartCard";
import { useCustomerFieldLabel } from "@/context/customer/CustomerFieldLabelContext";

export default function DistributionPanel() {
  const [distributionData, setDistributionData] = useState([]);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [filterBy, setFilterBy] = useState("Campaign");
  const [isLoading, setIsLoading] = useState(true);
    const { getLabel, labels } = useCustomerFieldLabel();

  // Map business terminology to database schemas for the dropdown
  const filterOptions = [
    { label: `By ${getLabel("Campaign","Campaign")}`, value: "Campaign" },
    { label: `By ${getLabel("CustomerType","Employee Type")}`, value: "CustomerType" },
    { label: `By ${getLabel("CustomerSubType","Employee Subtype")}`, value: "CustomerSubType" }
  ];

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const res = await getEmployeeDistributionData(filterBy);
      if (res?.success) {
        setDistributionData(res.data);
        setTotalEmployees(res.total);
      }
      setIsLoading(false);
    };

    fetchData();
  }, [filterBy]); // Re-fetch whenever the dropdown changes

  return (
    <div className="max-w-xl">
      <DonutChartCard
        title="Employee Distribution"
        totalLabel="Employees"
        totalCount={totalEmployees}
        data={distributionData}
        dropdownOptions={filterOptions}
        selectedValue={filterBy}
        onDropdownChange={(val) => setFilterBy(val)}
        isLoading={isLoading}
      />
    </div>
  );
}