from typing import Any, Dict, List, NamedTuple, Callable, Optional
import sqlite3
from fastapi import HTTPException
from pydantic import BaseModel, model_validator

class DashboardGraphParams(BaseModel):
    graph_ids: List[int]
    xy_coords: List[List[int]]
    width_height: List[List[int]]

    @model_validator(mode='before')
    def check_values(cls, data: Any) -> Any:
        graph_ids = data.get('graph_ids')
        xy_coords = data.get('xy_coords')
        width_height = data.get('width_height')
        
        # Ensure all lists are present
        if any(x is None for x in [graph_ids, xy_coords, width_height]):
            raise HTTPException(status_code=400, detail="Missing required fields.")
        
        # Check if all lists have the same length
        if not (len(graph_ids) == len(xy_coords) == len(width_height)):
            raise HTTPException(status_code=400, detail="Arrays are not of the same length.")
        
        # Check if each xy_coords element has exactly two integers
        if not all(len(xy) == 2 for xy in xy_coords):
            raise HTTPException(
                status_code=400,
                detail="Each element in xy_coords must be a list of two integers [x,y]."
            )
        
        # Check if each width_height element has exactly two integers
        if not all(len(wh) == 2 for wh in width_height):
            raise HTTPException(
                status_code=400,
                detail="Each element in width_height must be a list of two integers."
            )
        return data
class DashboardPermission(BaseModel):
    user_email: str
    permission_type: str  # 'owner', 'view', or 'edit'
class DashboardCreateQueryParams(DashboardGraphParams):
    dashboard_title: str
    owner_email: str
    permissions: List[DashboardPermission] = []
    access_level: str = 'private'

    @model_validator(mode='before')
    def validate_access_level(cls, data: Any) -> Any:
        access_level = data.get('access_level', 'private')
        if access_level not in ['private', 'public', 'all_users']:
            raise HTTPException(
                status_code=400,
                detail="access_level must be either 'private', 'public', or 'all_users'"
            )
        return data

class DashboardPutQueryParams(DashboardGraphParams):
    dashboard_id: int
    requester_email: str

class DashboardDeleteQueryParams(BaseModel):
    dashboard_id: int
    graph_ids: Optional[List[int]] = []
    xy_coords: Optional[List[List[int]]] = []

    @model_validator(mode='before')
    def check_lengths(cls, data: Any) -> Any:
        graph_ids, xy_coords = data.get('graph_ids'), data.get('xy_coords')
        if (graph_ids or xy_coords) and not(len(graph_ids) == len(xy_coords)):
            raise HTTPException(status_code=400, detail="Arrays are not of the same length.")
        return data

class DashboardGraphMetadata(BaseModel):
    graph_id: int
    width: int
    height: int
    x_coord: int
    y_coord: int

class DashboardMetadata(BaseModel):
    dashboard_id: int
    dashboard_title: str
    metadata_graphs: List[DashboardGraphMetadata]
    permission_type: str
    access_level: str
    created_by: str

class DashboardMapResponse(BaseModel):
    dashboard_metadatas: List[DashboardMetadata]

class DashboardLayoutUpdateParams(BaseModel):
    dashboard_id: int
    graph_ids: List[int]
    xy_coords: List[List[int]]
    width_height: List[List[int]]

class DashboardCreateWithPermissions(BaseModel):
    dashboard_title: str
    owner_email: str
    graph_ids: List[int] = []
    xy_coords: List[List[int]] = []
    width_height: List[List[int]] = []
    shared_with: List[DashboardPermission] = []

class DashboardPermissionResponse(BaseModel):
    user_email: str
    permission_type: str

class DeletePermissionParams(BaseModel):
    dashboard_id: int
    user_email: str
    requester_email: str

class DashboardAccessLevelUpdate(BaseModel):
    dashboard_id: int
    access_level: str
    requester_email: str

    @model_validator(mode='before')
    def validate_access_level(cls, data: Any) -> Any:
        access_level = data.get('access_level')
        if access_level not in ['private', 'public', 'all_users']:
            raise HTTPException(
                status_code=400,
                detail="access_level must be either 'private', 'public', or 'all_users'"
            )
        return data

class DashboardManager:
    def __init__(self, get_connection_callback: Callable[[], sqlite3.Connection]):
        self.get_sql_db_connection = get_connection_callback
        self.__create_tables()

    def delete_dashboard(self, query: DashboardDeleteQueryParams):
        with self.get_sql_db_connection() as conn:
            # Set the row factory to sqlite3.Row to get dictionary-like row objects
            conn.row_factory = sqlite3.Row

            dashboard_id = query.dashboard_id

            # Check if the dashboard_id exists
            if not self.__dashboard_exists(dashboard_id=dashboard_id, db_conn=conn):
                raise HTTPException(status_code=404, detail=f"Dashboard with id {dashboard_id} not found.")

            # Delete the entire dashboard if no graph_ids or xy_coords are provided
            if not query.graph_ids and not query.xy_coords:
                self.__delete_entire_dashboard(dashboard_id, db_conn=conn)
            else: # Otherwise, delete specified graphs
                GRAPH_IDS = query.graph_ids
                XY_COORDS = query.xy_coords
                DASHBOARD_IDS = [dashboard_id for _ in range(len(GRAPH_IDS))]
                DELETE_QUERY = """
                    DELETE FROM master_dashboard 
                    WHERE 1=1
                        AND dashboard_id = ? 
                        AND graph_id = ?

                """
                values = list(zip(DASHBOARD_IDS, GRAPH_IDS))
                conn.executemany(DELETE_QUERY, values)
            conn.commit()

    def get_dashboard(self, dashboard_id: int, user_email: str = None) -> DashboardMetadata:
        with self.get_sql_db_connection() as conn:
            conn.row_factory = sqlite3.Row

            # First check access level
            access_result = conn.execute("""
                SELECT dashboard_title, access_level, created_by
                FROM dashboard_title_mp
                WHERE dashboard_id = ?
            """, (dashboard_id,)).fetchone()

            if not access_result:
                raise HTTPException(status_code=404, detail="Dashboard not found")

            if access_result['access_level'] != 'public' and not user_email:
                raise HTTPException(
                    status_code=403,
                    detail="This dashboard requires authentication"
                )

            # Check user permissions if user_email is provided
            if user_email:
                result = conn.execute("""
                    SELECT permission_type
                    FROM dashboard_permissions
                    WHERE dashboard_id = ? AND user_email = ?
                """, (dashboard_id, user_email)).fetchone()
                   

                if result:
                    permission_type = result['permission_type']
                else:
                    permission_type = 'view' if access_result['access_level'] in ['public', 'all_users'] else None

                if not permission_type:
                    raise HTTPException(
                        status_code=403,
                        detail="You don't have permission to access this dashboard"
                    )
            else:
                # Default to view if public and no user_email
                permission_type = 'view'

            # Retrieve the graph metadata
            cursor = conn.execute("""
                SELECT graph_id, width, height, x_coord, y_coord
                FROM master_dashboard
                WHERE dashboard_id = ?
            """, (dashboard_id,))

            rows = cursor.fetchall()
            metadata_graphs = [
                DashboardGraphMetadata(
                    graph_id=row['graph_id'],
                    width=row['width'],
                    height=row['height'],
                    x_coord=row['x_coord'],
                    y_coord=row['y_coord']
                ) for row in rows
            ]

            return DashboardMetadata(
                dashboard_id=dashboard_id,
                dashboard_title=access_result['dashboard_title'],
                metadata_graphs=metadata_graphs,
                permission_type=permission_type,
                access_level=access_result['access_level'],
                created_by=access_result['created_by']
            )

    # def get_dashboard_id_mp(self) -> DashboardMapResponse:
    #     with self.get_sql_db_connection() as conn:
    #         # Set row factory to get dictionary-like row objects
    #         conn.row_factory = sqlite3.Row

    #         # Retrieve all dashboards with their metadata
    #         dashboards = conn.execute("""
    #             SELECT dt.dashboard_id, dt.dashboard_title, 
    #                 md.graph_id, md.width, md.height, md.x_coord, md.y_coord
    #             FROM dashboard_title_mp AS dt
    #             LEFT JOIN master_dashboard AS md ON dt.dashboard_id = md.dashboard_id
    #             ORDER BY dt.dashboard_id
    #         """).fetchall()

    #         # Group metadata by dashboard_id
    #         dashboard_map = {}
    #         for row in dashboards:
    #             dashboard_id = row['dashboard_id']
    #             if dashboard_id not in dashboard_map:
    #                 dashboard_map[dashboard_id] = {
    #                     "dashboard_id": dashboard_id,
    #                     "dashboard_title": row['dashboard_title'],
    #                     "metadata_graphs": []
    #                 }
                
    #             # Append graph metadata if exists
    #             if row['graph_id'] is not None:
    #                 dashboard_map[dashboard_id]["metadata_graphs"].append(
    #                     DashboardGraphMetadata(
    #                         graph_id=row['graph_id'],
    #                         width=row['width'],
    #                         height=row['height'],
    #                         x_coord=row['x_coord'],
    #                         y_coord=row['y_coord']
    #                     )
    #                 )

    #         # Convert dictionary to list of DashboardMetadata objects
    #         dashboard_metadatas = [
    #             DashboardMetadata(
    #                 dashboard_id=meta["dashboard_id"],
    #                 dashboard_title=meta["dashboard_title"],
    #                 metadata_graphs=meta["metadata_graphs"], 

    #             ) for meta in dashboard_map.values()
    #         ]

    #         return DashboardMapResponse(dashboard_metadatas=dashboard_metadatas)

    # def create_new_dashboard(self, query: DashboardCreateQueryParams) -> int:
    #     with self.get_sql_db_connection() as conn:
    #         cursor = conn.execute(
    #             "INSERT INTO dashboard_title_mp (dashboard_title) VALUES (?)",
    #             (query.dashboard_title,)
    #         )
    #         dashboard_id = cursor.lastrowid

    #         # Updated data preparation to use paired xy coordinates
    #         data_to_insert = [
    #             (dashboard_id, graph_id, xy[0], xy[1], width, height)
    #             for graph_id, xy, (width, height) in zip(query.graph_ids, query.xy_coords, query.width_height)
    #             ]

    #         # Insert the data into the master_dashboard table
    #         conn.executemany(
    #             """
    #             INSERT INTO master_dashboard (dashboard_id, graph_id, x_coord, y_coord, width, height)
    #             VALUES (?, ?, ?, ?, ?, ?)
    #             """,
    #             data_to_insert
    #         )

    #         # Commit the transaction
    #         conn.commit()

    #     # Optionally, return the dashboard_id
    #     return dashboard_id

    def add_to_dashboard(self, query: DashboardPutQueryParams) -> int:
        dashboard_id = query.dashboard_id
        with self.get_sql_db_connection() as conn:
            # Set row factory to get dictionary-like row objects
            conn.row_factory = sqlite3.Row

            # Check if the dashboard_id exists
            result = conn.execute(
                "SELECT dashboard_title FROM dashboard_title_mp WHERE dashboard_id = ?",
                (dashboard_id,)
            ).fetchone()

            if result is None:
                raise HTTPException(status_code=404, detail=f"Dashboard with id {dashboard_id} not found.")

            # Retrieve existing graph_ids and idxs in the dashboard
            # existing_entries = conn.execute(
            #     "SELECT graph_id, idx FROM master_dashboard WHERE dashboard_id = ?",
            #     (dashboard_id,)
            # ).fetchall()

            # existing_idxs = {row['idx'] for row in existing_entries}

            # Check for idx values that are already used
            # conflicting_xy_coords = set(query.xy_coords) & {row['xy_coords'] for row in existing_entries}
            # if conflicting_xy_coords:
            #     raise HTTPException(
            #         status_code=400, 
            #         detail=f"XY coordinates {conflicting_xy_coords} are already used in the dashboard."
            #     )

            # Prepare the data for bulk insertion
            data_to_insert = [
                (dashboard_id, graph_id, xy[0], xy[1], width, height)
                for graph_id, xy, (width, height) in zip(query.graph_ids, query.xy_coords, query.width_height)
                ]

            # Insert the data into the master_dashboard table
            conn.executemany(
                """
                INSERT INTO master_dashboard (dashboard_id, graph_id, x_coord, y_coord, width, height)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                data_to_insert
            )

            # Commit the transaction
            conn.commit()

        # Return the dashboard_id
        return dashboard_id

    def __delete_entire_dashboard(
            self, 
            dashboard_id: int, *, 
            db_conn: sqlite3.Connection = None
        ):
        DELETE_QUERY = "DELETE FROM dashboard_title_mp WHERE dashboard_id = ?"
        if not db_conn:
            with self.get_sql_db_connection() as conn:
                conn.execute(DELETE_QUERY, (dashboard_id, ))
                conn.commit()
        else:
            db_conn.execute(DELETE_QUERY, (dashboard_id, ))
            db_conn.commit()

    def __dashboard_exists(self, dashboard_id: int, *, db_conn: sqlite3.Connection = None):
        SELECT_QUERY = "SELECT dashboard_title FROM dashboard_title_mp WHERE dashboard_id = ?"
        if not db_conn:
            with self.get_sql_db_connection() as conn:
                res = conn.execute(SELECT_QUERY, (dashboard_id,)).fetchone()
        else:
            res = db_conn.execute(SELECT_QUERY, (dashboard_id,)).fetchone()
        return res is not None

    def __create_tables(self):
        with self.get_sql_db_connection() as conn:
            # Add dashboard permissions table
            conn.execute("""
                CREATE TABLE IF NOT EXISTS dashboard_permissions (
                    dashboard_id INTEGER NOT NULL,
                    user_email TEXT NOT NULL,
                    permission_type TEXT NOT NULL CHECK(permission_type IN ('owner', 'view', 'edit')),
                    PRIMARY KEY (dashboard_id, user_email),
                    FOREIGN KEY (dashboard_id) REFERENCES dashboard_title_mp(dashboard_id) ON DELETE CASCADE
                )
            """)
            
            conn.execute("""
                CREATE TABLE IF NOT EXISTS master_dashboard (
                    dashboard_id INTEGER NOT NULL,
                    graph_id INTEGER NOT NULL,
                    width INTEGER NOT NULL,
                    height INTEGER NOT NULL,
                    x_coord INTEGER NOT NULL,
                    y_coord INTEGER NOT NULL,
                    PRIMARY KEY (dashboard_id, graph_id),
                    FOREIGN KEY (graph_id) REFERENCES graphs(graph_id) ON DELETE CASCADE,
                    FOREIGN KEY (dashboard_id) REFERENCES dashboard_title_mp(dashboard_id) ON DELETE CASCADE
                )
            """)
            conn.execute("""
                CREATE TABLE IF NOT EXISTS dashboard_title_mp (
                    dashboard_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    dashboard_title TEXT NOT NULL,
                    created_by TEXT NOT NULL,
                    access_level TEXT NOT NULL DEFAULT 'private' 
                        CHECK(access_level IN ('private', 'public', 'all_users'))
                )
            """)
            conn.commit()

    def update_dashboard_layout(self, query: DashboardLayoutUpdateParams) -> None:
        with self.get_sql_db_connection() as conn:
            # Update each graph's layout information
            for graph_id, xy, (width, height) in zip(query.graph_ids, query.xy_coords, query.width_height):
                conn.execute("""
                    UPDATE master_dashboard 
                    SET x_coord = ?, y_coord = ?, width = ?, height = ?
                    WHERE dashboard_id = ? AND graph_id = ?
                """, (xy[0], xy[1], width, height, query.dashboard_id, graph_id))
            conn.commit()

    def create_dashboard_with_permissions(self, query: DashboardCreateQueryParams) -> int:
        with self.get_sql_db_connection() as conn:
            # Insert dashboard title, owner, and access level
            cursor = conn.execute(
                """
                INSERT INTO dashboard_title_mp 
                (dashboard_title, created_by, access_level) 
                VALUES (?, ?, ?)
                """,
                (query.dashboard_title, query.owner_email, query.access_level)
            )
            dashboard_id = cursor.lastrowid

            # Insert owner permission
            conn.execute(
                """
                INSERT INTO dashboard_permissions 
                (dashboard_id, user_email, permission_type) 
                VALUES (?, ?, ?)
                """,
                (dashboard_id, query.owner_email, 'owner')
            )

            # Insert shared permissions
            if query.permissions:  # Changed from shared_with to permissions
                conn.executemany(
                    """
                    INSERT INTO dashboard_permissions 
                    (dashboard_id, user_email, permission_type) 
                    VALUES (?, ?, ?)
                    """,
                    [(dashboard_id, p.user_email, p.permission_type) 
                     for p in query.permissions]  # Changed from shared_with to permissions
                )

            # Insert graph data if any
            if query.graph_ids:
                data_to_insert = [
                    (dashboard_id, graph_id, xy[0], xy[1], width, height)
                    for graph_id, xy, (width, height) 
                    in zip(query.graph_ids, query.xy_coords, query.width_height)
                ]
                conn.executemany(
                    """
                    INSERT INTO master_dashboard 
                    (dashboard_id, graph_id, x_coord, y_coord, width, height)
                    VALUES (?, ?, ?, ?, ?, ?)
                    """,
                    data_to_insert
                )
            conn.commit()
            return dashboard_id

    def get_user_dashboards(self, user_email: str) -> DashboardMapResponse:
        with self.get_sql_db_connection() as conn:
            conn.row_factory = sqlite3.Row
            
            # Modified query to handle all permission cases
            dashboards = conn.execute("""
                SELECT DISTINCT 
                    dt.dashboard_id, 
                    dt.dashboard_title,
                    dt.created_by,
                    dt.access_level,
                    COALESCE(dp.permission_type, 
                        CASE 
                            WHEN dt.access_level IN ('public', 'all_users') THEN 'view'
                            ELSE NULL 
                        END
                    ) as permission_type,
                    md.graph_id, 
                    md.width, 
                    md.height, 
                    md.x_coord, 
                    md.y_coord
                FROM dashboard_title_mp dt
                LEFT JOIN dashboard_permissions dp 
                    ON dt.dashboard_id = dp.dashboard_id 
                    AND dp.user_email = ?
                LEFT JOIN master_dashboard md 
                    ON dt.dashboard_id = md.dashboard_id
                WHERE 
                    dp.user_email = ?  -- User has explicit permissions
                    OR dt.access_level = 'public'  -- Public dashboards
                    OR (dt.access_level = 'all_users' AND ? IS NOT NULL)  -- All users dashboards if email is valid
                ORDER BY dt.dashboard_id
            """, (user_email, user_email, user_email))

            # Update the dashboard_map dictionary creation
            dashboard_map = {}
            for row in dashboards:
                dashboard_id = row['dashboard_id']
                if dashboard_id not in dashboard_map:
                    dashboard_map[dashboard_id] = {
                        "dashboard_id": dashboard_id,
                        "dashboard_title": row['dashboard_title'],
                        "created_by": row['created_by'],
                        "permission_type": row['permission_type'],
                        "access_level": row['access_level'],
                        "metadata_graphs": []
                    }
                
                if row['graph_id'] is not None:
                    dashboard_map[dashboard_id]["metadata_graphs"].append(
                        DashboardGraphMetadata(
                            graph_id=row['graph_id'],
                            width=row['width'],
                            height=row['height'],
                            x_coord=row['x_coord'],
                            y_coord=row['y_coord']
                        )
                    )

            dashboard_metadatas = [
                DashboardMetadata(
                    dashboard_id=meta["dashboard_id"],
                    dashboard_title=meta["dashboard_title"],
                    metadata_graphs=meta["metadata_graphs"],
                    permission_type=meta["permission_type"],
                    access_level=meta["access_level"],
                    created_by=meta["created_by"]
                ) for meta in dashboard_map.values()
            ]

            return DashboardMapResponse(dashboard_metadatas=dashboard_metadatas)

    def check_user_permission(
        self, 
        dashboard_id: int, 
        user_email: str, 
        required_permission: str = 'view'
    ) -> bool:
        with self.get_sql_db_connection() as conn:
            result = conn.execute("""
                SELECT permission_type 
                FROM dashboard_permissions 
                WHERE dashboard_id = ? AND user_email = ?
            """, (dashboard_id, user_email)).fetchone()
            
            if not result:
                return False
            
            permission = result[0]
            if required_permission == 'view':
                return True  # Any permission allows viewing
            elif required_permission == 'edit':
                return permission in ['edit', 'owner']
            elif required_permission == 'owner':
                return permission == 'owner'
            return False

    def update_permissions(
        self, 
        dashboard_id: int, 
        permissions: List[DashboardPermission], 
        requester_email: str
    ) -> None:
        if not self.check_user_permission(dashboard_id, requester_email, 'owner'):
            raise HTTPException(
                status_code=403, 
                detail="Only the dashboard owner can modify permissions"
            )
        
        with self.get_sql_db_connection() as conn:
            # Use UPSERT (INSERT OR REPLACE) for each permission
            conn.executemany(
                """
                INSERT OR REPLACE INTO dashboard_permissions 
                (dashboard_id, user_email, permission_type) 
                VALUES (?, ?, ?)
                """,
                [(dashboard_id, p.user_email, p.permission_type) 
                 for p in permissions]
            )
            conn.commit()

    def get_dashboard_permissions(
        self, 
        dashboard_id: int,
        requester_email: str
    ) -> List[DashboardPermissionResponse]:
        with self.get_sql_db_connection() as conn:
            conn.row_factory = sqlite3.Row
            
            # First verify requester has permission to view permissions
            owner_check = conn.execute("""
                SELECT permission_type 
                FROM dashboard_permissions 
                WHERE dashboard_id = ? AND user_email = ?
            """, (dashboard_id, requester_email)).fetchone()
            
            if not owner_check or owner_check['permission_type'] != 'owner':
                raise HTTPException(
                    status_code=403,
                    detail="Only the owner can view permissions"
                )
            
            # Get all permissions
            permissions = conn.execute("""
                SELECT user_email, permission_type
                FROM dashboard_permissions
                WHERE dashboard_id = ?
            """, (dashboard_id,)).fetchall()
            
            return [
                DashboardPermissionResponse(
                    user_email=row['user_email'],
                    permission_type=row['permission_type']
                ) for row in permissions
            ]

    def delete_dashboard_permission(
        self,
        dashboard_id: int,
        user_email: str,
        requester_email: str
    ) -> None:
        with self.get_sql_db_connection() as conn:
            conn.row_factory = sqlite3.Row  # Add this line
            
            # First verify requester is owner
            owner_check = conn.execute("""
                SELECT permission_type 
                FROM dashboard_permissions 
                WHERE dashboard_id = ? AND user_email = ?
            """, (dashboard_id, requester_email)).fetchone()
            
            if not owner_check or owner_check['permission_type'] != 'owner':
                raise HTTPException(
                    status_code=403,
                    detail="Only the owner can delete permissions"
                )
                
            # Don't allow deleting owner's permission
            target_check = conn.execute("""
                SELECT permission_type 
                FROM dashboard_permissions 
                WHERE dashboard_id = ? AND user_email = ?
            """, (dashboard_id, user_email)).fetchone()
            
            if not target_check:
                raise HTTPException(
                    status_code=404,
                    detail=f"Permission not found for user {user_email}"
                )
                
            if target_check['permission_type'] == 'owner':
                raise HTTPException(
                    status_code=400,
                    detail="Cannot delete owner's permission"
                )
            
            # Delete the permission
            conn.execute("""
                DELETE FROM dashboard_permissions
                WHERE dashboard_id = ? AND user_email = ?
            """, (dashboard_id, user_email))
            
            conn.commit()

    def update_access_level(
        self,
        dashboard_id: int,
        access_level: str,
        requester_email: str
    ) -> None:
        with self.get_sql_db_connection() as conn:
            # First verify requester is owner
            owner_check = conn.execute("""
                SELECT permission_type 
                FROM dashboard_permissions 
                WHERE dashboard_id = ? AND user_email = ?
            """, (dashboard_id, requester_email)).fetchone()
            
            if not owner_check or owner_check[0] != 'owner':
                raise HTTPException(
                    status_code=403,
                    detail="Only the owner can update the access level"
                )
            
            # Update the access level
            conn.execute("""
                UPDATE dashboard_title_mp 
                SET access_level = ?
                WHERE dashboard_id = ?
            """, (access_level, dashboard_id))
            
            conn.commit()

    