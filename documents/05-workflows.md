# Workflows

## Overview

The Jewelry ERP application implements several key workflows to manage the jewelry manufacturing process. This document describes these workflows in detail.

## Order Management Workflow

### Order Creation Process

1. User clicks "New Order" button
2. User selects order type (Stock or Customer)
3. If Customer order, user selects a customer
4. User adds SKUs to the order
   - User can select existing SKUs or create new ones
   - User specifies quantity for each SKU
5. User sets production and delivery dates
6. User adds any remarks or special instructions
7. User saves the order
8. System automatically creates jobs for each SKU in the order

## Job Workflow

Each job goes through a defined workflow with multiple phases.

\`\`\`mermaid
stateDiagram-v2
    [*] --> NewJob: Create Job
    NewJob --> BagCreated: Create Bag
    BagCreated --> StoneSelected: Select Stones
    StoneSelected --> DiamondSelected: Select Diamonds
    DiamondSelected --> SentToManufacturer: Assign Manufacturer
    SentToManufacturer --> InProduction: Start Production
    InProduction --> ReceivedFromManufacturer: Complete Production
    ReceivedFromManufacturer --> QualityCheck: Perform QC
    QualityCheck --> QCPassed: Pass QC
    QualityCheck --> QCFailed: Fail QC
    QCFailed --> InProduction: Rework
    QCPassed --> Completed: Complete Job
    Completed --> [*]
\`\`\`

### Job Phases

1. **New Job**
   - Initial state when job is created
   - Next action: Create bag for materials

2. **Bag Created**
   - Materials bag has been created
   - Next action: Select stones

3. **Stone Selection**
   - Process:
     1. User selects stone lot
     2. User specifies quantity and weight
     3. User submits stone selection
     4. System generates stone selection sticker
   - Next action: Select diamonds

4. **Diamond Selection**
   - Process:
     1. User selects diamond lot
     2. User specifies karat, clarity, quantity, and weight
     3. User submits diamond selection
     4. System generates diamond selection sticker
   - Next action: Assign manufacturer

5. **Manufacturer Selection**
   - Process:
     1. User selects manufacturer from list
     2. User sets expected completion date
     3. User submits manufacturer assignment
     4. System generates manufacturer sticker
   - Next action: Send to manufacturer

6. **In Production**
   - Job is with manufacturer
   - Next action: Receive from manufacturer

7. **Quality Check**
   - Process:
     1. User measures weight
     2. User inspects item quality
     3. User adds notes
     4. User marks QC as passed or failed
     5. System generates QC sticker
   - Next action: Complete job or return for rework

8. **Completed**
   - Job is finished
   - No further actions required

## Team Workflows

Different teams have specific workflows within the system.

### Stone Selection Team Workflow

\`\`\`mermaid
flowchart TD
    Start([Start]) --> ViewJobs[View Jobs in Stone Selection Phase]
    ViewJobs --> SelectJob[Select Job to Process]
    SelectJob --> ViewSKUDetails[View SKU Details]
    ViewSKUDetails --> SelectStoneLot[Select Stone Lot]
    SelectStoneLot --> EnterQuantity[Enter Stone Quantity]
    EnterQuantity --> EnterWeight[Enter Stone Weight]
    EnterWeight --> SubmitSelection[Submit Stone Selection]
    SubmitSelection --> PrintSticker[Print Stone Selection Sticker]
    PrintSticker --> End([End])
\`\`\`

### Diamond Selection Team Workflow

\`\`\`mermaid
flowchart TD
    Start([Start]) --> ViewJobs[View Jobs in Diamond Selection Phase]
    ViewJobs --> SelectJob[Select Job to Process]
    SelectJob --> ViewSKUDetails[View SKU Details]
    ViewSKUDetails --> SelectDiamondLot[Select Diamond Lot]
    SelectDiamondLot --> EnterKarat[Enter Karat]
    EnterKarat --> EnterClarity[Enter Clarity]
    EnterClarity --> EnterQuantity[Enter Diamond Quantity]
    EnterQuantity --> EnterWeight[Enter Diamond Weight]
    EnterWeight --> SubmitSelection[Submit Diamond Selection]
    SubmitSelection --> PrintSticker[Print Diamond Selection Sticker]
    PrintSticker --> End([End])
\`\`\`

### Quality Control Team Workflow

\`\`\`mermaid
flowchart TD
    Start([Start]) --> ViewJobs[View Jobs in QC Phase]
    ViewJobs --> SelectJob[Select Job to Process]
    SelectJob --> MeasureWeight[Measure Item Weight]
    MeasureWeight --> CompareWeight{Weight Matches Spec?}
    CompareWeight -- Yes --> InspectQuality[Inspect Quality]
    CompareWeight -- No --> AddNotes[Add Notes]
    InspectQuality --> QualityOK{Quality OK?}
    QualityOK -- Yes --> MarkPassed[Mark QC as Passed]
    QualityOK -- No --> AddNotes
    AddNotes --> MarkFailed[Mark QC as Failed]
    MarkPassed --> PrintSticker[Print QC Sticker]
    MarkFailed --> ReturnToManufacturer[Return to Manufacturer]
    PrintSticker --> End([End])
    ReturnToManufacturer --> End
\`\`\`

## Status Transitions

The following table shows the valid status transitions for jobs:

| Current Status | Action | Next Status |
|----------------|--------|-------------|
| New Job | Create Bag | Bag Created |
| Bag Created | Select Stones | Stone Selected |
| Stone Selected | Select Diamonds | Diamond Selected |
| Diamond Selected | Assign Manufacturer | Sent to Manufacturer |
| Sent to Manufacturer | Start Production | In Production |
| In Production | Complete Production | Received from Manufacturer |
| Received from Manufacturer | Pass QC | Quality Check Passed |
| Received from Manufacturer | Fail QC | Quality Check Failed |
| Quality Check Failed | Rework | In Production |
| Quality Check Passed | Complete Job | Completed |
