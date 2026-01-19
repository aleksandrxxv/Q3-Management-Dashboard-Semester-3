import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
import { fetchMolds } from "@/lib/supabase/fetchMolds";
import Link from "next/link";
import Header from "../header";
import { MoldMaintenance } from "@/types/supabase";
import { Progress } from "@/components/ui/progress";
import { unstable_cache } from "next/cache";

export default async function Page() {
    const getMoldsCached = unstable_cache(
    async () => fetchMolds(),
    ["molds"],
    { revalidate: 10 }
  );
    const molds = await getMoldsCached();

    const maintenance_interval = 100000;
    // calculate levels duur
    const calculateLevensduurLeft = (mold: MoldMaintenance) => {
        
      // return a number between 0 and 100
      // if low shots, return 0
      // eg mold.total_shots_since_maintenance = 100k
      // mold.maintenance_interval = 100k
      // return 0

      // if high shots, return 100

      const shots = mold.total_shots - mold.milestone_shots;
      
      if (shots <= 0) {
        return 0;
      }

      if (shots >= maintenance_interval) {
        return 100;
      }

      return (shots / maintenance_interval) * 100;
    }

    
    
    return (
      <>
        <Header
          title={"Mold lifespan"}
          description="Overview of all molds and their lifespan"
        />
       <div >
         <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">
            Mold
          </TableHead>

          {/* total shots */}
          <TableHead>
            Board - Port
            </TableHead>

            <TableHead>
            First used
            </TableHead>
            
            <TableHead>
            Last used
            </TableHead>

          {/* Levensduur */}
          <TableHead>
            Lifespan
            </TableHead>

            

           

          
        </TableRow>
      </TableHeader>
      <TableBody>
        {molds.map((mold) => (
          <TableRow key={mold.mold_id}>
            <TableCell className="font-medium">
              <Link key={mold.mold_id} href={`/dashboard/molds/${mold.mold_id}`} className="text-blue-500 underline">
              {mold.mold_name || mold.mold_id}
                </Link>
              </TableCell>

            <TableCell>
              {
                mold.board && mold.port ? `${mold.board} - ${mold.port}` : (
                  "N/A"
                )
              }
            </TableCell>


            <TableCell>{
              new Date(mold.first_used).toLocaleDateString(
                "nl-NL",
              )
              }</TableCell>
            <TableCell>{
              new Date(mold.last_used).toLocaleDateString(
                "nl-NL",
              )

              }</TableCell>

            <TableCell>

              <div>
                <div>
                  {mold.total_shots} 
                </div>
              <Progress value={calculateLevensduurLeft(mold)} />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
            <TableCell colSpan={5}>
                Total: {molds.length} molds
            </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
       </div>
       </>
    );
    }


