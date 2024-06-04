export interface BaggageJourneyInfo {
    fullBagTagNumber: string
    bagTagNumber: string
    bagTagIndexNumber: string
    bagTagIssuingAirlineCode: string
    bagTagPrinterId: string
    recordLocator: string
    firstName: string
    lastName: string
    bookingFirstName: string
    bookingLastName: string
    bagTagActivationStatus: string
    isActive: string
    scheduledItinerarySegments: ScheduledItinerarySegment[]
    scans: any[]
  }
  
  export interface ScheduledItinerarySegment {
    segmentNumber: number
    marketingAirlineCode: string
    operatingAirlineCode: string
    operatingFlightNumber: string
    scheduledDepartureDateStnLocal: string
    scheduledDepartureStationCode: string
    scheduledArrivalStationCode: string
    cabinCode: string
    seatNumber: string
    passengerStatus: string
    passengerProfileStatus: string
    authorityToLoad: string
    authorityToTransport: string
    bagTagStatus: string
    sourceSystemLastModifiedDateTime: string
  }
  

  export interface BaggageJourneyInfoResponse {
    
   }