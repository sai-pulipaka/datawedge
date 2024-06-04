import { Button } from "@/components/ui/button";
import {
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { useBaggageInfo } from "@/lib/getBaggageInfoHook";
import { Label } from "@radix-ui/react-label";

export const ScanModalContent = ({ barcode }: { barcode: string }) => {
  const bagJourneyInfo = useBaggageInfo(barcode);
  console.log({ bagJourneyInfo })

  if (!bagJourneyInfo === undefined) {
    return <></>;
  }

  return (
    <SheetContent side="bottom">
      <SheetHeader>
        <SheetTitle>{bagJourneyInfo?.fullBagTagNumber}</SheetTitle>
        <SheetDescription>{}</SheetDescription>
      </SheetHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
         
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          
        </div>
      </div>
      <SheetFooter>
        <SheetClose asChild>
          <Button type="submit">Save changes</Button>
        </SheetClose>
      </SheetFooter>
    </SheetContent>
  );
};
