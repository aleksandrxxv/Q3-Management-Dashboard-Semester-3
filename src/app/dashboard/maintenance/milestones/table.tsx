import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"

import { Milestone, MoldMaintenance } from "@/types/supabase";
import Link from "next/link";
import { MilestoneStatus } from "./status";
import { CheckIcon, XIcon } from "lucide-react";

// Props
interface MilestoneProps {
    milestones: Milestone[];
    molds: MoldMaintenance[];
}

export const MilestoneTable = ({ 
    milestones,
    molds
 }: MilestoneProps) => {
    return (
        <Table>
            <TableCaption>
                Which type of maintenance at how many shots
            </TableCaption>
            <TableHeader>
                <TableRow>

                <TableHead>
                        Mold active
                    </TableHead>

                    <TableHead>Mold</TableHead>
                    
                    <TableHead>Type</TableHead>

                    <TableHead>
                        Send SMS
                    </TableHead>


                    <TableHead>
                       Milestone / Total shots
                    </TableHead>



                   
                </TableRow>
            </TableHeader>
            <TableBody>
                {
                    milestones.map((milestone, index) => {
                        const mold = molds.find(mold => mold.mold_id === milestone.mold_id);

                        if (!mold) {
                            return null;
                        }

                        // progress
                        const progress = (milestone.milestone_shots / mold.total_shots) * 100;

                        return (
                            <TableRow key={index}>
                                <TableCell className="flex items-center space-x-2">
                                    {mold.board ? (
                                        <><CheckIcon size={24} color="green" /> Yes</>
                                    ) : (
                                        <>
                                        <XIcon size={24} color="red" /> No </>
                                    )
                                    }
                                </TableCell>

                                <TableCell>
                                    <Link href={`/dashboard/molds/${milestone.mold_id}`} className="text-blue-500">
                                        {milestone.mold_id}
                                
                                    </Link> 
                                </TableCell>
                                
                                <TableCell>
                                    {milestone.maintenance_type}

                                    
                                </TableCell>

                                <TableCell>
                                    {milestone.send_sms ? "Yes" : "No"}
                                </TableCell>

                                <TableCell>
                                    <MilestoneStatus milestone={milestone} mold={mold} />
                                </TableCell>



                                
                                
                                
                                
                            </TableRow>
                        )
                    })
                }
            </TableBody>
        </Table>
    );
}