<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ApplicationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $taxpayer = $this->whenLoaded('taxpayer', fn () => $this->taxpayer);
        $property = $this->whenLoaded('propertyDetail', fn () => $this->propertyDetail);
        $location = $this->whenLoaded('location', fn () => $this->location);
        $technical = $this->whenLoaded('technicalData', fn () => $this->technicalData);

        return [
            'id' => $this->id,
            'intakeRef' => $this->intake_ref,
            'taxpayerName' => $this->taxpayer_name,
            'propertyType' => $this->property_type,
            'barangay' => $this->barangay,
            'submissionDate' => $this->submission_date?->format('Y-m-d'),
            'status' => $this->status instanceof \BackedEnum ? $this->status->value : $this->status,
            'lastAssessorAction' => $this->last_assessor_action,
            'remarks' => $this->remarks ?? '',
            'taxExempt' => (bool) $this->tax_exempt,
            'exemptionNotes' => $this->exemption_notes,
            'verificationStatus' => $this->verification_status,
            'createdAt' => $this->created_at?->toIso8601String(),
            'updatedAt' => $this->updated_at?->toIso8601String(),
            'taxpayer' => $taxpayer ? [
                'lastName' => $taxpayer->last_name,
                'firstName' => $taxpayer->first_name,
                'middleName' => $taxpayer->middle_name,
                'tin' => $taxpayer->tin,
                'address' => $taxpayer->address,
                'contact' => $taxpayer->contact,
                'email' => $taxpayer->email,
            ] : null,
            'property' => $property ? [
                'pin' => $property->pin,
                'arpNumber' => $property->arp_number,
                'landClassification' => $property->land_classification,
                'actualUse' => $property->actual_use,
                'totalArea' => (string) $property->total_area,
                'surveyNumber' => $property->survey_number,
            ] : null,
            'location' => $location ? [
                'street' => $location->street,
                'barangay' => $location->barangay,
                'municipality' => $location->municipality,
                'province' => $location->province,
                'zip' => $location->zip,
            ] : null,
            'technical' => $technical ? [
                'northBoundary' => $technical->north_boundary,
                'southBoundary' => $technical->south_boundary,
                'eastBoundary' => $technical->east_boundary,
                'westBoundary' => $technical->west_boundary,
                'areaMeasurement' => $technical->area_measurement,
                'surveyReference' => $technical->survey_reference,
                'buildingType' => $technical->building_type,
                'floors' => $technical->floors,
                'buildingArea' => $technical->building_area,
            ] : null,
            'documents' => ApplicationDocumentResource::collection(
                $this->whenLoaded('documents', fn () => $this->documents, []),
            ),
        ];
    }
}
