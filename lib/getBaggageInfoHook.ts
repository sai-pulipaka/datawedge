import { useQuery } from "@tanstack/react-query";
import { BaggageJourneyInfo } from "./types";

export const useBaggageInfo = (barcode: string) => {
  const { data: bagJourneyInfo } = useQuery({
    queryKey: [barcode],
    queryFn: async () => {
      const response = await fetch(
        `https://apis.qa.alaskaair.com/aag/1/guestservices/baggagemanagement/baggagejourney/bags/${barcode}`,
        {
          headers: {
            "Ocp-Apim-Subscription-Key": "77916b3c9e2f4e2cbdec7c498ebf6fd9",
          },
        }
      );
      const data: BaggageJourneyInfo[] = await response.json();
      return data;
    },
    select: (list) => list[0],
    enabled: barcode.length === 10,
  });
  return bagJourneyInfo;
};
